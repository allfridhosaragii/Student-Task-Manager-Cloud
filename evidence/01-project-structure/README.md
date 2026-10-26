# BUKTI 1: STRUKTUR PROJECT DAN KONFIGURASI DOCKER

## 1. Deskripsi Bukti
Bukti ini mendokumentasikan struktur pohon direktori project Student Task Manager, berkas konfigurasi `Dockerfile` mandiri, dan orkestrasi `compose.yaml`.

## 2. Berkas Bukti yang Tersedia di Folder Ini
1. **`project_structure.txt`**: Daftar hierarki direktori dan berkas project lengkap (bebas dari `node_modules` dan `.git`).
2. **`bukti_01_github_project_structure.png`**: Tangkapan layar repositori resmi di GitHub (`https://github.com/allfridhosaragii/Student-Task-Manager-Cloud`) yang menampilkan struktur kode sumber, file konfigurasi, dan komit.

## 3. Komponen Utama yang Tervalidasi
- **Struktur Folder**:
  - `src/`: Server Express, routing API, controller, PostgreSQL service, dan migrasi skema database.
  - `public/`: Antarmuka web frontend statis responsif (HTML5, CSS3, JavaScript ES6+).
  - `tests/`: Test suite unit & integrasi PostgreSQL.
  - `scripts/`: Skrip otomatisasi deployment dan verifikasi bukti di Azure VM Ubuntu.
  - `docs/`: Dokumentasi arsitektur, panduan deployment, dan matriks kepatuhan praktikum.
  - `evidence/`: Tujuh (7) folder penampung bukti pengujian resmi.
- **Konfigurasi Dockerfile**:
  - Multi-stage build (`deps` dan `runner`).
  - Base image resmi `node:20-alpine`.
  - Non-root execution (`USER node`).
  - Internal container healthcheck endpoint.
- **Konfigurasi compose.yaml**:
  - Dua (2) service utama: `app` dan `database`.
  - Isolasi internal network: `student_task_backend` dengan `internal: true`.
  - Persistent named volume: `postgres_data` terpasang di `/var/lib/postgresql/data`.
  - Service healthcheck dependency: `depends_on: database: condition: service_healthy`.
  - Kebijakan restart: `unless-stopped` pada kedua service.

## 4. Status Bukti
- **Status:** TERVERIFIKASI & LENGKAP (Artefak teks struktur dan tangkapan layar visual repositori tersedia).
