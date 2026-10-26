# 📚 Student Task Manager — Cloud Docker Edition

> **Tugas Praktikum Individu Mata Kuliah Komputasi Awan (Semester 5)**  
> **Modul:** *Virtualisasi Proyek via Docker pada Azure Virtual Machine*  
> **Nama Mahasiswa:** Allfridho Prima Anjaynata Saragi (NIM: 102062400045)  
> **Infrastruktur Target:** Microsoft Azure Virtual Machine (`edo-praktikum2`, Ubuntu 24.04 LTS)  
> **GitHub Repository:** https://github.com/allfridhosaragii/Student-Task-Manager-Cloud  
> **Live Public IP:** http://70.153.150.99

---

## 1. Deskripsi Proyek
**Student Task Manager** adalah aplikasi web manajemen penugasan akademik yang dirancang untuk membantu mahasiswa mencatat, mengelola, menyaring, dan memantau status tugas kuliah secara terorganisir. Aplikasi ini dibangun dengan arsitektur *full-stack* yang terintegrasi langsung dengan database relasional PostgreSQL serta dikemas menggunakan teknologi kontainerisasi Docker dan orkestrasi Docker Compose.

---

## 2. Delapan (8) Ketentuan Wajib Asprak
Aplikasi dan infrastruktur ini dirancang dan diimplementasikan untuk memenuhi 8 ketentuan wajib dari asisten praktikum:
1. **Dockerfile sendiri:** Multi-stage custom Dockerfile berbasis `node:20-alpine` dengan pengguna non-root `node`.
2. **Compose minimal dua service:** Orkestrasi service `app` (Express.js) dan `database` (PostgreSQL 16) via `compose.yaml`.
3. **Internal network database:** Database terisolasi pada custom network `student_task_backend` dengan `internal: true`.
4. **Persistent volume:** Data PostgreSQL tersimpan aman pada named volume `postgres_data`.
5. **Database healthcheck dan depends_on condition service_healthy:** App menunggu database siap sebelum melayani request.
6. **Restart unless-stopped pada setiap service utama:** Kebijakan pemulihan mandiri otomatis aktif pada seluruh service.
7. **Keamanan .env dan .env.example:** Template non-rahasia pada `.env.example`, file `.env` dilindungi dari Git dan Docker image.
8. **Deployment Azure VM yang dapat diakses melalui IP publik:** Berjalan stabil pada Azure VM `edo-praktikum2` (`http://70.153.150.99`).

---

## 3. Fitur Utama Aplikasi
- **Dashboard Ringkasan Statistik:** Menampilkan metrik tugas secara *real-time* (Total Tugas, Menunggu/Pending, Sedang Dikerjakan, Selesai).
- **Manajemen Tugas Lengkap (CRUD):** Tambah tugas baru, lihat rincian tugas, ubah informasi tugas, dan hapus tugas dengan modal konfirmasi aman.
- **Pencarian Cepat (*Instant Search*):** Fitur pencarian otomatis berdasarkan judul tugas, mata kuliah, maupun deskripsi dengan optimasi *debounce*.
- **Penyaringan & Pengurutan Ganda (*Multi-Filter & Sorter*):** Filter tugas berdasarkan status pengerjaan, tingkat prioritas (Rendah, Sedang, Tinggi), dan pengurutan berdasarkan tanggal deadline terdekat/terjauh serta abjad.
- **Pengubah Status Instan (*Quick Status Changer*):** Ubah status tugas langsung dari kartu tugas tanpa harus membuka formulir edit.
- **Indikator Kesehatan Sistem (*Live System Status*):** Memantau konektivitas backend dan latensi PostgreSQL secara *real-time*.
- **Desain Modern & Responsif:** Menggunakan antarmuka gelap (*dark theme*) yang bersih, tipografi *Plus Jakarta Sans*, aksen warna modern, dan kompatibel pada layar desktop maupun *smartphone*.

---

## 4. Tumpukan Teknologi (Tech Stack)
- **Frontend:** Semantic HTML5, Modern Vanilla CSS3 (Custom Variables, Responsive Grid/Flexbox), Vanilla JavaScript ES6+ (Modular & Event-driven).
- **Backend Runtime:** Node.js v20 (Alpine Linux LTS) & Express.js.
- **Database:** PostgreSQL 16 Alpine resmi.
- **Database Client:** Pustaka `pg` (node-postgres) dengan *connection pooling* dan kueri terparameterisasi (*parameterized queries*).
- **Containerization:** Docker Engine & Docker Compose V2.
- **Infrastruktur Cloud:** Microsoft Azure Virtual Machine Ubuntu 24.04 LTS (Region Indonesia Central).
- **Version Control:** Git & GitHub.

---

## 5. Struktur Direktori Proyek

```text
Student-Task-Manager/
├── src/
│   ├── server.js                 # Entrypoint server, graceful shutdown, binding 0.0.0.0:3000
│   ├── app.js                    # Konfigurasi Express, middleware, static files, rute
│   ├── config/
│   │   └── environment.js        # Pembacaan konfigurasi environment variables (.env)
│   ├── database/
│   │   ├── db.js                 # Connection pool PostgreSQL, uji koneksi berkala
│   │   └── migrate.js            # Migrasi skema database otomatis dan seeding idempotent
│   ├── routes/
│   │   ├── taskRoutes.js         # Rute API RESTful (/api/tasks)
│   │   └── healthRoutes.js       # Rute healthcheck server dan database (/health)
│   ├── controllers/
│   │   └── taskController.js     # Validasi input data, status HTTP, format respon JSON
│   ├── services/
│   │   └── taskService.js        # Business logic dan query SQL terparameterisasi ($1, $2)
│   └── middleware/
│       └── errorHandler.js       # Penanganan error terpusat dan penanganan rute 404
├── public/
│   ├── index.html                # Antarmuka web responsif dan semantik
│   ├── css/
│   │   └── style.css             # Desain styling modern, tema gelap, animasi transisi
│   └── js/
│       └── app.js                # Frontend controller: fetch API, manipulasi DOM, modal
├── tests/
│   └── api.test.js               # Pengujian otomatis API (8 test suites, Node native test runner)
├── scripts/
│   ├── deploy-azure.sh           # Skrip otomatisasi deployment di Azure VM (Ubuntu)
│   ├── verify-evidence.sh        # Skrip otomatisasi pemeriksaan 7 bukti praktikum di VM
│   └── test-local.ps1            # Skrip verifikasi dan pengujian lokal (PowerShell)
├── docs/
│   ├── INITIAL_ASSESSMENT.md     # Laporan asesmen lingkungan awal
│   ├── ARCHITECTURE.md           # Rincian arsitektur perangkat lunak dan diagram sistem
│   ├── DOCKER_EXPLANATION.md     # Penjelasan teknis Dockerfile dan compose.yaml
│   ├── DEPLOYMENT_GUIDE.md       # Panduan langkah demi langkah deployment ke Azure VM
│   ├── TESTING_GUIDE.md          # Panduan lengkap pelaksanaan pengujian dan 7 bukti
│   ├── SECURITY.md               # Kebijakan dan implementasi keamanan sistem
│   ├── TROUBLESHOOTING.md        # Panduan pemecahan masalah kendala umum
│   ├── REQUIREMENTS_MATRIX.md    # Matriks keterlacakan 8 ketentuan & 7 bukti praktikum
│   ├── FINAL_STATUS.md           # Laporan status akhir implementasi
│   └── LAPORAN_DRAFT.md          # Draft isi laporan praktikum untuk asisten praktikum
├── evidence/                     # Folder penampung bukti screenshot pengujian (01 s/d 07)
├── Dockerfile                    # Multi-stage Dockerfile resmi aplikasi (deps + runner)
├── .dockerignore                 # Pengecualian berkas rahasia dan cache dari build Docker
├── compose.yaml                  # Spesifikasi orkestrasi 2 service, network, dan volume
├── .env                          # Berkas konfigurasi lingkungan aktif lokal/server
├── .env.example                  # Template konfigurasi aman tanpa nilai rahasia
├── .gitignore                    # Pengecualian berkas rahasia (.env, SSH key) dari Git
├── package.json                  # Konfigurasi dependensi dan skrip proyek
├── package-lock.json             # Kunci dependensi npm untuk deterministik build
└── README.md                     # Dokumentasi komprehensif proyek
```

---

## 6. Arsitektur & Penjelasan Konfigurasi Docker

### 6.1 Desain Multi-Stage Dockerfile
Aplikasi menggunakan `Dockerfile` multi-stage:
1. **Stage `deps` (Dependencies):** Menggunakan `node:20-alpine`. Hanya menyalin `package.json` dan `package-lock.json` untuk memanfaatkan *layer caching*. Menjalankan `npm ci --omit=dev` untuk mengunduh modul produksi secara bersih.
2. **Stage `runner` (Production Runtime):** Menyalin modul hasil stage pertama dan kode sumber aplikasi. Beralih ke pengguna non-root `USER node` demi keamanan. Mengekspos port 3000 dan menjalankan *internal healthcheck* kontainer.

### 6.2 Konfigurasi `compose.yaml`
- **Service `app`:**
  - Dibangun dari Dockerfile lokal (`build: .`).
  - Memetakan port host `80:3000` (`HOST_HTTP_PORT=80`).
  - Terhubung ke dua jaringan: `frontend` (akses publik) dan `backend` (akses privat).
  - Menggunakan `depends_on: database: condition: service_healthy` agar tidak mulai sebelum PostgreSQL siap.
  - Kebijakan `restart: unless-stopped`.
- **Service `database`:**
  - Menggunakan image `postgres:16-alpine`.
  - Terhubung **hanya** ke jaringan internal `backend`.
  - **TIDAK memiliki mapping port host** (port 5432 tidak terbuka ke publik).
  - Menyimpan data pada named volume `postgres_data`.
  - Memiliki `healthcheck` menggunakan perintah `pg_isready`.
  - Kebijakan `restart: unless-stopped`.

### 6.3 Isolasi Jaringan (Network Isolation)
- Network `frontend`: Driver `bridge` standar untuk komunikasi aplikasi dengan host.
- Network `backend`: Driver `bridge` dengan atribut `internal: true`. Jaringan ini melarang lalu lintas keluar/masuk langsung ke internet dan host, memastikan database hanya dapat dijangkau oleh aplikasi.

### 6.4 Persistensi Data (Persistent Volume)
Named volume `postgres_data` dipetakan ke `/var/lib/postgresql/data`. Data tugas tetap aman di host bahkan saat kontainer dimatikan dengan `docker compose down`.

---

## 7. Panduan Menjalankan Proyek Secara Mandiri

### 7.1 Prasyarat Menjalankan
- Docker Engine v24+ atau Docker Desktop.
- Docker Compose V2.
- (Opsional untuk testing lokal tanpa Docker) Node.js v20+ dan npm.

### 7.2 Menyiapkan File Lingkungan (.env)
Salin template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan nilai variabel jika diperlukan (misalnya IP publik atau password database).

### 7.3 Membangun & Menjalankan Kontainer
```bash
# Validasi sintaks compose
docker compose config -q

# Build image dan jalankan service di background
docker compose up -d --build
```

### 7.4 Memeriksa Status & Log Kontainer
```bash
# Periksa status kontainer dan healthcheck
docker compose ps

# Lihat log aplikasi
docker compose logs -f app

# Lihat log database
docker compose logs -f database
```

### 7.5 Menghentikan & Menjalankan Kembali Service
```bash
# Menghentikan kontainer tanpa menghapus data
docker compose down

# Menjalankan kontainer kembali
docker compose up -d
```
> *Catatan: Jangan tambahkan flag `-v` pada perintah down agar volume data tidak terhapus.*

---

## 8. Panduan Deployment ke Azure Virtual Machine

1. **Nyalakan Virtual Machine:**
   Buka Azure Portal -> VM `edo-praktikum2` -> klik **Start**. Catat alamat IP Publiknya (contoh: `70.153.150.99`).
2. **Koneksi Melalui SSH:**
   ```powershell
   ssh -i $HOME\.ssh\id_ed25519 azureuser@70.153.150.99
   ```
3. **Kloning Repositori / Salin Kode:**
   ```bash
   git clone https://github.com/allfridhosaragii/Student-Task-Manager-Cloud.git ~/Student-Task-Manager
   cd ~/Student-Task-Manager
   ```
4. **Jalankan Skrip Deployment Otomatis:**
   ```bash
   chmod +x scripts/*.sh
   ./scripts/deploy-azure.sh 70.153.150.99
   ```
5. **Akses Website:**
   Buka browser laptop dan kunjungi:
   ```text
   http://70.153.150.99
   ```

---

## 9. Prosedur Pembuktian 7 Bukti Wajib Praktikum

Seluruh bukti pengujian disimpan pada folder `evidence/`:
1. **Bukti 1 (Struktur & Config):** `evidence/01-project-structure/` (`project_structure.txt`, `bukti_01_github_project_structure.png`).
2. **Bukti 2 (Status Container):** `evidence/02-container-status/` (`docker_compose_ps.txt` - kedua kontainer `healthy`).
3. **Bukti 3 (Akses Public IP):** `evidence/03-public-access/` (`student_task_manager_live.png` - web UI live di port 80).
4. **Bukti 4 (Overview Azure):** `evidence/04-azure-overview/` (`azure_vm_running_overview.png`, `azure_vm_stopped_deallocated.png`).
5. **Bukti 5 (Persistensi Data):** `evidence/05-data-persistence/` (`bukti_05_uji_persistensi_data.png`, `persistence_test_log.txt`).
6. **Bukti 6 (Keamanan Network):** `evidence/06-network-security/` (`network_inspect.json`, `docker_socket_security.txt`).
7. **Bukti 7 (Restart Policy):** `evidence/07-restart-test/` (`restart_policy.json`, `runtime_crash_restart_proof.txt`).

Rincian panduan dan penjelasan teknis tersedia di [docs/TESTING_GUIDE.md](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/docs/TESTING_GUIDE.md).

---

## 10. Penghematan Kredit Azure for Students

Untuk mencegah terkurasnya saldo kredit Azure saat tidak digunakan:
1. Matikan kontainer: `docker compose down`
2. Buka Azure Portal -> VM `edo-praktikum2` -> klik tombol **Stop** (Deallocate).
3. Status berubah menjadi **Stopped (deallocated)** yang menandakan alokasi daya komputasi telah dihentikan.
4. Nyalakan kembali saat akan didemonstrasikan kepada asisten praktikum.

---

## 11. Lisensi & Hak Cipta
Dibuat sebagai karya akademik Tugas Praktikum Individu Mata Kuliah Komputasi Awan, Semester 5.  
Seluruh hak cipta kode sumber dilindungi untuk keperluan pembelajaran akademik.
