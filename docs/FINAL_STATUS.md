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

## 2. Implemented but Awaiting User VM Trigger (Telah Diimplementasikan, Menunggu VM Dinyalakan)

- **Deployment Runtime ke Azure VM (`edo-praktikum2`):**
  - Seluruh source code, skrip deployment, dan panduan transfer SSH telah siap.
  - Sesuai batasan keamanan: *"Jangan melakukan deployment cloud, GitHub push, restart VM, atau perubahan resource Azure tanpa persetujuan pengguna."*
  - Eksekusi runtime deployment di VM dan pengambilan screenshot browser publik tinggal dijalankan begitu pengguna menyalakan VM Azure via Portal.

---

## 3. Blocked by Environment or Access (Hambatan Akses)

- **Akses Azure CLI Otomatis:**  
  CLI `az` tidak terinstal di Windows laptop pengguna, dan kredensial cloud tidak disimpan di workspace untuk menjaga keamanan kredit Azure for Students. Pengelolaan VM dilakukan via Azure Portal dan akses SSH.

---

## 4. Not Completed (Pekerjaan Belum Selesai)

- **Nihil (0 item):** Seluruh kode, konfigurasi Docker, pengujian fungsional, matriks persyaratan, dan dokumentasi telah diselesaikan 100%.
