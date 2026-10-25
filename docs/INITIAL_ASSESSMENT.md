# Penilaian Awal Lingkungan Pengembangan (Initial Assessment)

**Tanggal Pemeriksaan:** 25 Oktober 2026  
**Project:** Student Task Manager  
**Mata Kuliah:** Komputasi Awan — Praktikum 2 (Tugas Individu)  
**Workspace:** `P:\Semester 5\Komputasi awan\Week 6\Student-Task-Manager`

---

## 1. Hasil Pemeriksaan Sistem & Perangkat Lunak

| Komponen | Status Temuan | Keterangan / Versi |
| :--- | :---: | :--- |
| **Sistem Operasi** | OK | Microsoft Windows 11 (NT 10.0.26300.0) |
| **Shell Utama** | OK | Windows PowerShell 5.1 / PowerShell 7 |
| **Node.js** | OK | `v24.1.0` (LTS/Modern Runtime) |
| **npm** | OK | `11.3.0` |
| **Git** | OK | `git version 2.52.0.windows.1` |
| **Docker CLI** | OK | `Docker version 29.8.2, build 7fc2dff` |
| **Docker Compose** | OK | `Docker Compose version v5.5.1` (V2 Engine) |
| **Docker Daemon Lokal** | Terbatas | CLI terinstal; daemon background service Docker Desktop lokal saat ini belum berjalan di sesi Windows ini. |
| **Kunci SSH Azure** | OK | Ditemukan pasangan kunci `~/.ssh/id_ed25519` dan `~/.ssh/id_ed25519.pub` (dibuat 19 Oktober 2026). |
| **Azure CLI (az)** | Tidak Terinstal | Perintah manajemen Azure akan dijalankan via Azure Portal dan akses SSH langsung ke VM. |
| **Konflik Port Lokal** | Bersih | Port 80, 3000, dan 5432 tidak digunakan oleh proses lain di host. |

---

## 2. Pemeriksaan Struktur Direktori & Template

- Folder `P:\Semester 5\Komputasi awan\Week 6` awalnya kosong tanpa file lama.
- Subfolder `Student-Task-Manager` telah dibuat dengan hierarki standar yang diwajibkan:
  - `src/` (config, database, routes, controllers, services, middleware)
  - `public/` (css, js, assets)
  - `tests/`
  - `scripts/`
  - `docs/`
  - `evidence/` (01 hingga 07)
- Template resmi laporan belum terdapat di folder `Week 6`. Draft laporan lengkap disiapkan pada `docs/LAPORAN_DRAFT.md` yang siap dipindahkan ke format template resmi asprak saat template diunggah.

---

## 3. Strategi Pelaksanaan & Pengujian

1. **Aplikasi & Database:**
   - Dibangun dengan arsitektur Node.js Express.js yang modular dan PostgreSQL (`pg` driver).
   - Menyediakan RESTful API lengkap (CRUD) dan UI modern, clean, dan responsif.
   - Menggunakan mekanisme migrasi database idempotent (dapat dijalankan berulang tanpa merusak data).
2. **Containerization & Dockerfile:**
   - Multi-stage build Node.js Alpine resmi (`node:20-alpine`) untuk image yang ringan, aman, dan caching optimal.
   - Non-root user (`node`) untuk keamanan container.
3. **Docker Compose:**
   - Layanan `app` dan `database` (PostgreSQL 16 Alpine).
   - Isolasi network dengan `internal: true` pada network backend.
   - Persistensi data menggunakan named volume `postgres_data`.
   - Healthcheck pada PostgreSQL via `pg_isready` dan `depends_on: condition: service_healthy` pada app.
   - Restart policy `unless-stopped` pada kedua service.
4. **Verifikasi Lingkungan:**
   - Pengujian kode lokal (unit test, mock database, functional test) dijalankan via Node.js test runner / scripts.
   - Pengujian containerization penuh dan 7 bukti praktikum disiapkan secara langsung di Azure Virtual Machine (`edo-praktikum2`) dengan Docker Engine & Compose yang sudah aktif di Linux Ubuntu 24.04 LTS.
