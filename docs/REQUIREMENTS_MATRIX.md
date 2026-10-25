# Matriks Kesesuaian Persyaratan Tugas (Requirements Traceability Matrix)

**Mata Kuliah:** Komputasi Awan (Praktikum 2 Tugas Individu)  
**Judul Modul:** Virtualisasi Proyek via Docker pada Azure Virtual Machine  
**Nama Proyek:** Student Task Manager  
**Tanggal Evaluasi:** 25 Oktober 2026  

---

## Matriks 1: Delapan (8) Ketentuan Wajib Modul Praktikum

| No. | Ketentuan Wajib | Deskripsi Implementasi | Lokasi File Terkait | Metode Verifikasi | Status | Bukti / Catatan |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | **Dockerfile Sendiri** | Dibuat custom dari awal dengan multi-stage build (`deps` & `runner`), base image resmi `node:20-alpine`, optimasi layer cache `npm ci`, non-root user `node`, bind ke `0.0.0.0:3000`. | [Dockerfile](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/Dockerfile) | Validasi sintaks Dockerfile dan verifikasi stage build. | **PASS** | `Dockerfile` mandiri selesai dibuat dan bebas dari salinan Portify. |
| **2** | **Minimal Dua Service** | File `compose.yaml` mendefinisikan tepat dua service utama: `app` (Node.js/Express) dan `database` (PostgreSQL 16 Alpine). | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L5-L48) | Eksekusi `docker compose config` dan parsing berkas YAML. | **PASS** | Terverifikasi dua service: `app` dan `database`. |
| **3** | **Network Internal** | Jaringan `student_task_backend` dikonfigurasi dengan `internal: true`. Service `database` hanya terhubung ke network internal tanpa konfigurasi `ports`. | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L36-L58) | Inspeksi `compose.yaml` dan pengujian isolasi port 5432. | **PASS** | Database tidak mengekspos port ke host maupun internet. |
| **4** | **Volume Persisten** | Didefinisikan named volume `postgres_data` yang dipetakan ke direktori `/var/lib/postgresql/data`. Data tetap aman saat kontainer dihapus via `docker compose down`. | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L35-L66) | Inspeksi section `volumes` dan skrip pengujian persistensi data. | **PASS** | Named volume `student_task_postgres_data` aktif. |
| **5** | **Healthcheck & Depends_On** | Service `database` memiliki healthcheck `pg_isready`. Service `app` menggunakan `depends_on: database` dengan `condition: service_healthy`. | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L21-L47) | Pengujian urutan startup kontainer dan deteksi status healthy. | **PASS** | App tertahan hingga database healthy sebelum mulai melayani request. |
| **6** | **Restart Policy** | Kedua service (`app` dan `database`) dikonfigurasi dengan kebijakan `restart: unless-stopped`. | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L9-L30) | Inspeksi `compose.yaml` dan `docker inspect` HostConfig.RestartPolicy. | **PASS** | Terverifikasi pada kedua service kontainer. |
| **7** | **Keamanan Lingkungan (.env)** | Kredensial disimpan dalam `.env`. Template non-rahasia disajikan pada `.env.example`. File `.env` masuk dalam `.gitignore` dan `.dockerignore`. | [.env.example](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/.env.example)<br/>[.gitignore](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/.gitignore) | Git status audit memastikan `.env` tidak ter-staging. | **PASS** | `.env` terisolasi dari Git dan Image. |
| **8** | **Deployment Azure VM** | Aplikasi berjalan di Azure VM (`edo-praktikum2`, `70.153.150.99`) pada port 80 dan dapat diakses dari browser internet. | [scripts/deploy-azure.sh](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/scripts/deploy-azure.sh)<br/>[evidence/03-public-access/](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/03-public-access/) | Akses HTTP `http://70.153.150.99:80` dan verifikasi healthcheck. | **PASS** | Terverifikasi live di Azure VM `edo-praktikum2`. |

---

## Matriks 2: Tujuh (7) Bukti Pengujian Wajib Praktikum

| No. | Nama Bukti Pengujian | Target Bukti | Panduan & Perintah Pengujian | Status Saat Ini | Rencana Pengambilan Bukti |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1** | **Struktur Project & Konfigurasi** | Folder tree, Dockerfile, compose.yaml | Jalankan `scripts/verify-evidence.sh` atau screenshot editor/terminal. | **PASS** | Tersedia di [evidence/01-project-structure/](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/01-project-structure/). |
| **2** | **Status Container di Azure VM** | Output `docker compose ps` di VM | Eksekusi `docker compose ps` pada terminal SSH VM `edo-praktikum2`. | **PASS** | Terverifikasi di [evidence/02-container-status/docker_compose_ps.txt](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/02-container-status/docker_compose_ps.txt) (keduanya Up healthy). |
| **3** | **Aplikasi via Public IP** | Website terbuka di `http://70.153.150.99` | Buka browser menuju alamat IP publik VM Azure port 80. | **PASS** | Screenshot dashboard live di [evidence/03-public-access/student_task_manager_live.png](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/03-public-access/student_task_manager_live.png). |
| **4** | **Halaman Overview Azure** | Screenshot Portal Azure VM | Buka Azure Portal -> VM `edo-praktikum2` (Status Running & Public IP `70.153.150.99`). | **PASS** | Screenshot di [evidence/04-azure-overview/azure_vm_running_overview.png](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/04-azure-overview/azure_vm_running_overview.png). |
| **5** | **Persistensi Data** | Data bertahan setelah `docker compose down` | Input tugas `UJI-PERSISTENSI-DOCKER` -> down -> up -d -> data tetap ada. | **PASS** | Teruji via `scripts/verify-evidence.sh` (Task ID #5 bertahan setelah down/up). |
| **6** | **Keamanan Network Database** | Port 5432 tidak terbuka ke publik/host | Verifikasi `docker compose ps database` dan inspect network internal. | **PASS** | [evidence/06-network-security/network_inspect.json](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/06-network-security/network_inspect.json) (`Internal: true`, koneksi host ditolak). |
| **7** | **Restart Container** | RestartPolicy `unless-stopped` | `docker inspect` & verifikasi `unless-stopped`. | **PASS** | [evidence/07-restart-test/restart_policy.json](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/07-restart-test/restart_policy.json) (`unless-stopped` pada app & db). |

---

## Keterangan Status:
- **PASS:** Persyaratan telah diimplementasikan, divalidasi, dan diuji secara nyata pada runtime Azure VM dan lingkungan lokal (100% PASS).
- **FAIL:** Persyaratan tidak terpenuhi (0 item).
- **BLOCKED:** Terhambat masalah teknis (0 item).

