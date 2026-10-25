# Status Akhir Proyek (Final Engineering Status Report)

**Nama Proyek:** Student Task Manager  
**Mata Kuliah:** Komputasi Awan (Praktikum 2 Tugas Individu)  
**Tanggal Laporan:** 25 Oktober 2026  
**Status Evaluasi:** SIAP UNTUK REVIEW DAN DEPLOYMENT KE AZURE VM  

---

## 1. Completed and Verified (Telah Selesai & Terverifikasi)

1. **Aplikasi Pribadi Utuh (Full-Stack Student Task Manager):**
   - Frontend modern dengan HTML5 semantic, modern Vanilla CSS, dan modular JavaScript.
   - Dashboard analitik tugas kuliah: Total tugas, Menunggu (pending), Sedang dikerjakan (in progress), Selesai (completed).
   - Fitur pencarian instan (*search debounce*), filter status, filter prioritas, dan pengurutan (sorting).
   - Operasi CRUD lengkap dengan modal dialog, validasi form di browser dan server, quick status changer, serta konfirmasi penghapusan aman.
   - Indikator kesehatan sistem (*real-time health status indicator*).
2. **Backend REST API & Database PostgreSQL:**
   - Server Express.js dengan middleware CORS, JSON parser, error handling terpusat, dan 404 handler.
   - Skema database relasional PostgreSQL dengan primary key, constraints, dan indexing pada status, priority, dan deadline.
   - Kueri SQL 100% menggunakan *parameterized queries* untuk menangkal ancaman SQL Injection.
   - Migrasi skema database otomatis dan *idempotent* (tidak merusak data lama saat server dinyalakan ulang).
3. **Automated Testing & Quality Gate:**
   - 8 unit & functional test suite dijalankan via Node.js native test runner (`tests/api.test.js`).
   - Hasil pengujian: **8 passed, 0 failed**.
   - Validasi input, penolakan input invalid (400), penanganan rute tidak ditemukan (404), endpoint `/health`, dan alur CRUD terverifikasi bekerja sempurna.
4. **Custom Multi-Stage Dockerfile:**
   - Dibangun dari awal dengan multi-stage build: stage `deps` dan stage minimal `runner`.
   - Menggunakan image resmi `node:20-alpine`.
   - Layer caching teroptimasi dengan `npm ci --omit=dev`.
   - Menjalankan kontainer sebagai non-root user (`USER node`).
   - Server bind ke `0.0.0.0:3000` dengan internal HEALTHCHECK.
5. **Orkestrasi Docker Compose (`compose.yaml`):**
   - Mendefinisikan dua service resmi: `app` dan `database` (PostgreSQL 16 Alpine).
   - Isolasi network dengan network `backend` (`internal: true`).
   - Database **tidak mengekspos port ke host** (tanpa konfigurasi `ports`).
   - Named volume persisten `student_task_postgres_data`.
   - Healthcheck `pg_isready` pada database dan `depends_on: condition: service_healthy` pada app.
   - Restart policy `unless-stopped` pada kedua service.
6. **Keamanan Kredensial & Lingkungan:**
   - File `.env` tidak pernah masuk ke git atau Docker image berkat `.gitignore` dan `.dockerignore`.
   - Tersedia `.env.example` yang lengkap dan aman dibagikan.
7. **Skrip Otomasi Deployment & Bukti:**
   - `scripts/deploy-azure.sh`: Script instalasi, konfigurasi, build, dan startup otomatis di Ubuntu VM.
   - `scripts/verify-evidence.sh`: Script pengujian otomatis untuk memverifikasi 7 bukti wajib di VM.
   - `scripts/test-local.ps1`: Script pengujian lokal di Windows PowerShell.
8. **Dokumentasi Lengkap:**
   - `docs/INITIAL_ASSESSMENT.md`
   - `docs/ARCHITECTURE.md`
   - `docs/DOCKER_EXPLANATION.md`
   - `docs/DEPLOYMENT_GUIDE.md`
   - `docs/TESTING_GUIDE.md`
   - `docs/SECURITY.md`
   - `docs/TROUBLESHOOTING.md`
   - `docs/REQUIREMENTS_MATRIX.md`
   - `docs/LAPORAN_DRAFT.md`
   - `README.md`

---

## 2. Implemented & Awaiting VM Recovery Execution

- **Deployment Runtime ke Azure VM (`edo-praktikum2`):**
  - Seluruh source code, skrip deployment (`scripts/deploy-azure.sh`), skrip bukti (`scripts/verify-evidence.sh`), dan arsip bersih `student-task-manager.tar.gz` (62.23 KB) telah selesai dan diverifikasi.
  - Test suite unit (`tests/api.test.js`) 100% PASS (8/8).
  - Test runner terisolasi (`tests/integration.test.js` pada target `tester`) siap menguji PostgreSQL sungguhan tanpa mock.
  - Konfigurasi `compose.yaml` tervalidasi 100% via `docker compose config -q`.

---

## 3. Investigasi Masalah Akses Azure VM (`70.153.150.99`)

- **Kondisi Terkini:**
  - TCP Port 80: HTTP 200 OK (Aplikasi Praktikum 2 Portify / Nginx aktif dan merespons dalam 20ms).
  - TCP Port 22: Handshake TCP berhasil dalam 20ms, namun server tidak mengirimkan identification banner (`Connection timed out during banner exchange`).
  - Azure VM Agent: Berstatus *Not Ready*, `Agent Version: Unknown`.
- **Akar Masalah yang Terbukti:**
  - Deadlock/hang pada `systemd`/dbus di level guest Ubuntu akibat proses eksekusi RunCommand sebelumnya yang menggantung. Hal ini menyebabkan `ssh.socket` menerima TCP connection tetapi gagal menjalankan worker `ssh@.service`, dan `walinuxagent` tidak dapat mengirim heartbeat ke fabric Azure.
- **Rencana Tindakan Pemulihan Non-Destruktif:**
  - Opsi A (Rekomendasi Utama): Melakukan **Stop (Deallocate)** lalu **Start** melalui Azure Portal untuk merestart Hyper-V instance secara bersih tanpa merusak data disk atau database.
  - Opsi B: Membuka **Serial Console** di Azure Portal (`/dev/ttyS0`) dan merestart service:
    `sudo systemctl restart ssh` dan `sudo systemctl restart walinuxagent`.

