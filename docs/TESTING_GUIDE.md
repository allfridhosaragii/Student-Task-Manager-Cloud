# Panduan Pengujian & Pengambilan 7 Bukti Wajib Praktikum

Dokumen ini memuat prosedur resmi pengujian untuk menghasilkan **Tujuh Bukti Pengujian Wajib** yang disyaratkan oleh asisten praktikum Komputasi Awan.

---

## Ringkasan Prosedur 7 Bukti Wajib

| No. Bukti | Nama Bukti | Lokasi Eksekusi | Perintah / Tindakan | Kriteria Keberhasilan |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Struktur Project & Konfigurasi | Laptop / VM | `tree`, `cat Dockerfile`, `cat compose.yaml` | Menampilkan struktur folder, multi-stage Dockerfile, 2 service, internal network, named volume, healthcheck, restart policy. |
| **2** | Status Container di Azure VM | Terminal SSH VM | `docker compose ps` | Service `app` & `database` berstatus `Up (healthy)`, port mapping `80:3000` pada app. |
| **3** | Akses Aplikasi via Public IP | Browser Laptop | Buka `http://<IP_PUBLIC_VM>` | Tampilan antarmuka website muncul sempurna tanpa error 500, address bar terlihat jelas. |
| **4** | Halaman Overview Azure Portal | Browser Laptop | Buka Azure Portal -> VM Overview | Menampilkan Nama VM (`edo-praktikum2`), status `Running`, dan Public IP yang sama persis dengan Bukti 3. |
| **5** | Uji Persistensi Data Database | Browser & Terminal | Tambah tugas `UJI-PERSISTENSI-DOCKER`, jalankan `docker compose down`, lalu `docker compose up -d` | Data tugas yang diinput sebelum container dimatikan tetap ada setelah container dinyalakan kembali. |
| **6** | Keamanan Network Database | Terminal SSH VM | `docker compose ps database`, `docker network inspect` | Database TIDAK memiliki port host (`0.0.0.0:5432`), network berstatus `internal: true`. |
| **7** | Kebijakan Restart Container | Terminal SSH VM | `docker inspect <container> --format='{{json .HostConfig.RestartPolicy}}'` | RestartPolicy menunjukkan `{"Name":"unless-stopped"}`. |

---

## Panduan Detail & Instruksi Screenshot Tiap Bukti

### BUKTI 1: STRUKTUR PROJECT DAN KONFIGURASI
1. **Langkah:**
   Buka terminal di root project dan jalankan:
   ```bash
   # Tampilkan susunan file
   ls -la
   
   # Tampilkan konfigurasi Dockerfile
   cat Dockerfile

   # Tampilkan konfigurasi compose.yaml
   cat compose.yaml
   ```
2. **Kondisi yang Harus Terlihat:**
   - Direktori `src/`, `public/`, `docs/`, `tests/`, `Dockerfile`, `compose.yaml`, `.env.example`.
   - File `.env` tidak terlihat di stage git (terlindungi `.gitignore`).
3. **Simpan Screenshot di:** `evidence/01-project-structure/`

---

### BUKTI 2: STATUS CONTAINER DI AZURE VM
1. **Langkah:**
   Di terminal SSH Azure VM:
   ```bash
   cd ~/Student-Task-Manager
   docker compose ps
   ```
2. **Kondisi yang Harus Terlihat:**
   - Container `student-task-app` dengan status `Up` (healthy) dan port `0.0.0.0:80->3000/tcp`.
   - Container `student-task-db` dengan status `Up` (healthy) dan port `5432/tcp` internal.
   - Tidak ada container yang berstatus `restarting` atau `exited`.
3. **Simpan Screenshot di:** `evidence/02-container-status/`

---

### BUKTI 3: APLIKASI MELALUI PUBLIC IP
1. **Langkah:**
   - Buka browser (Chrome / Edge / Firefox).
   - Masukkan URL: `http://<IP_PUBLIC_VM>` (contoh: `http://20.198.xxx.xxx`).
2. **Kondisi yang Harus Terlihat:**
   - Address bar browser terlihat jelas memuat IP publik.
   - Header aplikasi "Student Task Manager", indikator sistem `Online (PostgreSQL Healthy)`.
   - Dashboard statistik tugas dan daftar tugas kuliah tampil rapi.
3. **Simpan Screenshot di:** `evidence/03-public-access/`

---

### BUKTI 4: HALAMAN OVERVIEW AZURE
1. **Langkah:**
   - Buka [portal.azure.com](https://portal.azure.com) -> Virtual machines -> `edo-praktikum2`.
2. **Kondisi yang Harus Terlihat:**
   - Device name / Virtual machine: `edo-praktikum2`.
   - Status: `Running`.
   - Public IP address yang tertera identik dengan IP pada Bukti 3.
3. **Simpan Screenshot di:** `evidence/04-azure-overview/`

---

### BUKTI 5: UJI PERSISTENSI DATA
*PENTING: Jangan gunakan flag `-v` saat menjalankan docker compose down.*
1. **Langkah:**
   - Pada browser `http://<IP_PUBLIC_VM>`, klik **Tambah Tugas**.
   - Masukkan judul: `UJI-PERSISTENSI-DOCKER`, mata kuliah: `Komputasi Awan`, deadline: tanggal bebas. Klik **Simpan Tugas**.
   - Ambil screenshot pertama (kondisi data tersimpan di UI).
   - Di terminal SSH VM, matikan kontainer:
     ```bash
     docker compose down
     ```
   - Nyalakan kembali kontainer:
     ```bash
     docker compose up -d
     ```
   - Tunggu 5-10 detik hingga database healthy, lalu refresh browser `http://<IP_PUBLIC_VM>`.
   - Ambil screenshot kedua (tugas `UJI-PERSISTENSI-DOCKER` masih ada).
2. **Simpan Screenshot di:** `evidence/05-data-persistence/`

---

### BUKTI 6: KEAMANAN NETWORK DATABASE (ISOLASI INTERNAL)
1. **Langkah:**
   Di terminal SSH VM:
   ```bash
   # Periksa port database
   docker compose ps database

   # Periksa konfigurasi internal network
   docker network inspect student_task_backend | grep -E "Internal|Name"

   # Uji koneksi dari host ke database port 5432
   nc -z -v -w 2 127.0.0.1 5432 2>&1 || echo "Koneksi ke port 5432 ditolak (Aman)"
   ```
2. **Kondisi yang Harus Terlihat:**
   - Output `docker compose ps database` hanya menampilkan `5432/tcp` tanpa ada pemetaan `0.0.0.0:5432->5432`.
   - Atribut `"Internal": true` pada network backend.
   - Percobaan koneksi langsung ke port 5432 ditolak (*Connection refused*).
3. **Simpan Screenshot di:** `evidence/06-network-security/`

---

### BUKTI 7: VERIFIKASI RESTART CONTAINER
1. **Langkah:**
   Di terminal SSH VM:
   ```bash
   # Periksa restart policy kontainer app dan db
   docker inspect student-task-app --format='App RestartPolicy: {{json .HostConfig.RestartPolicy}}'
   docker inspect student-task-db --format='DB RestartPolicy: {{json .HostConfig.RestartPolicy}}'

   # Uji ketahanan dengan me-restart Docker service
   sudo systemctl restart docker
   sleep 5
   docker compose ps
   ```
2. **Kondisi yang Harus Terlihat:**
   - Output menunjukkan `{"Name":"unless-stopped"}`.
   - Setelah Docker daemon di-restart, kedua container otomatis kembali berjalan (*Up*) tanpa perlu menjalankan `docker compose up` manual.
3. **Simpan Screenshot di:** `evidence/07-restart-test/`
