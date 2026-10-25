# Penjelasan Konfigurasi Docker & Dockerfile

Dokumen ini menyajikan rincian teknis mengenai desain `Dockerfile` dan `compose.yaml` yang dibangun khusus untuk proyek **Student Task Manager**, sesuai 8 ketentuan wajib tugas praktikum Komputasi Awan.

---

## 1. Rincian & Manfaat Multi-Stage Dockerfile

Dockerfile dibangun dari awal (*custom-built*) menggunakan pendekatan **Multi-Stage Build** berbasis image resmi Node.js Alpine (`node:20-alpine`).

```dockerfile
# STAGE 1: Dependencies Builder
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# STAGE 2: Minimal Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN chown -R node:node /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node public/ ./public/

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
```

### Keunggulan Desain Ini:
1. **Optimasi Docker Layer Caching:**  
   File `package.json` dan `package-lock.json` disalin terlebih dahulu sebelum seluruh source code. Jika hanya source code atau CSS yang diubah, Docker akan menggunakan cache layer dependensi dari build sebelumnya sehingga proses build menjadi sangat cepat.
2. **Keterpisahan Build & Runtime (Multi-Stage):**  
   Stage `deps` bertanggung jawab menyelesaikan pengunduhan paket npm menggunakan `npm ci --omit=dev`. Stage `runner` hanya mengambil folder `node_modules` yang sudah bersih tanpa menyertakan cache instalasi, file compiler yang tidak terpakai, atau alat build lain.
3. **Ukuran Image Ringan:**  
   Penggunaan base image `alpine` menghasilkan ukuran kontainer akhir yang sangat kecil (~150MB dibandingkan image Node standar yang dapat mencapai >1GB).
4. **Keamanan Non-Root User (`USER node`):**  
   Secara default kontainer berjalan sebagai user `root`. Dengan menetapkan `USER node`, potensi eksploitasi privilege escalation pada host Linux dapat diminimalisir secara drastis.
5. **Bind Network `0.0.0.0`:**  
   Server Express dikonfigurasi untuk listen pada `0.0.0.0:3000`. Jika server hanya bind ke `127.0.0.1`, request yang diforward oleh Docker daemon dari luar kontainer akan ditolak.

---

## 2. Penjelasan Konfigurasi `compose.yaml`

File `compose.yaml` mengorkestrasi dua service utama:

### A. Service `app`
- **`build.context: .`**: Membangun image aplikasi secara langsung dari Dockerfile lokal.
- **`ports: - "${HOST_HTTP_PORT:-80}:3000"`**: Memetakan port HTTP 80 pada host VM ke port 3000 di dalam kontainer. Ini memungkinkan pengguna membuka website cukup dengan mengetik `http://<IP_PUBLIC_VM>`.
- **`networks: [frontend, backend]`**: Service `app` menjadi jembatan (bridge) yang dapat menerima lalu lintas dari luar melalui jaringan `frontend`, serta berkomunikasi dengan database melalui jaringan internal `backend`.
- **`depends_on.database.condition: service_healthy`**: Menjamin kontainer aplikasi tidak akan dijalankan sebelum kontainer PostgreSQL benar-benar siap melayani kueri SQL.
- **`restart: unless-stopped`**: Memastikan kontainer otomatis dinyalakan kembali saat Docker daemon atau VM mengalami reboot, kecuali kontainer dihentikan secara sengaja.

### B. Service `database`
- **`image: postgres:16-alpine`**: Menggunakan image PostgreSQL 16 Alpine yang stabil, aman, dan efisien.
- **`networks: [backend]`**: Hanya terhubung ke jaringan internal.
- **Tanpa Port Mapping (`ports`)**: Database sengaja tidak mempublikasikan port 5432 ke host untuk mematuhi **Ketentuan 3** (Isolasi Database).
- **`volumes: - postgres_data:/var/lib/postgresql/data`**: Menyimpan seluruh data tabel, indeks, dan transaksi PostgreSQL pada named volume Docker agar tidak hilang saat kontainer dimatikan.
- **`healthcheck`**: Menggunakan utilitas `pg_isready -U taskuser -d student_tasks` yang dijalankan setiap 5 detik untuk memastikan ketersediaan server database.

---

## 3. Matriks Perbandingan Port & Aksesibilitas

| Entitas | Port Internal Kontainer | Port Terbuka di Host VM | Dapat Diakses dari Internet |
| :--- | :---: | :---: | :---: |
| **Aplikasi Web (`app`)** | 3000 (TCP) | 80 (TCP) | **Ya** (Melalui IP Publik VM) |
| **Database (`database`)** | 5432 (TCP) | **Tidak Ada** | **Tidak** (Hanya internal Docker) |
