# Matriks Kesesuaian Persyaratan Tugas (Requirements Traceability Matrix)

**Mata Kuliah:** Komputasi Awan (Praktikum 2 Tugas Individu)  
**Judul Modul:** Virtualisasi Proyek via Docker pada Azure Virtual Machine  
**Nama Proyek:** Student Task Manager  
**Nama Mahasiswa:** Allfridho Prima Anjaynata Saragi (NIM: 102062400045)  
**Tanggal Evaluasi:** 26 Oktober 2026  

---

## Matriks 1: Delapan (8) Ketentuan Wajib Asprak

| No. | Ketentuan Wajib Asprak | Deskripsi Implementasi | Lokasi File Terkait | Metode Verifikasi | Status | Bukti / Catatan |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | **Dockerfile sendiri** | Dibuat custom dari awal dengan multi-stage build (`deps` & `runner`), base image resmi `node:20-alpine`, optimasi layer cache `npm ci`, non-root user `node`, bind ke `0.0.0.0:3000`. | [Dockerfile](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/Dockerfile) | Validasi sintaks Dockerfile dan verifikasi stage build. | **PASS** | `Dockerfile` mandiri selesai dibuat dan bebas dari salinan template lain. |
| **2** | **Compose minimal dua service** | File `compose.yaml` mendefinisikan tepat dua service utama: `app` (Node.js/Express) dan `database` (PostgreSQL 16 Alpine). | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L5-L48) | Eksekusi `docker compose config` dan parsing berkas YAML. | **PASS** | Terverifikasi dua service: `app` dan `database`. |
| **3** | **Internal network database** | Jaringan `student_task_backend` dikonfigurasi dengan `internal: true`. Service `database` hanya terhubung ke network internal tanpa konfigurasi `ports`. | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L36-L58) | Inspeksi `compose.yaml` dan pengujian isolasi port 5432 via netcat. | **PASS** | Database tidak mengekspos port ke host maupun internet (`Connection refused`). |
| **4** | **Persistent volume** | Didefinisikan named volume `postgres_data` yang dipetakan ke direktori `/var/lib/postgresql/data`. Data tetap aman saat kontainer dihapus via `docker compose down`. | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L35-L66) | Inspeksi section `volumes` dan skrip pengujian persistensi data. | **PASS** | Named volume `postgres_data` aktif dan data bertahan setelah down/up. |
| **5** | **Database healthcheck dan depends_on condition service_healthy** | Service `database` memiliki healthcheck `pg_isready`. Service `app` menggunakan `depends_on: database` dengan `condition: service_healthy`. | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L21-L47) | Pengujian urutan startup kontainer dan deteksi status healthy. | **PASS** | App tertahan hingga database healthy sebelum mulai melayani request. |
| **6** | **Restart unless-stopped pada setiap service utama** | Kedua service (`app` dan `database`) dikonfigurasi dengan kebijakan `restart: unless-stopped`. | [compose.yaml](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/compose.yaml#L9-L30) | Inspeksi `compose.yaml` dan simulasi kernel SIGKILL crash. | **PASS** | Terverifikasi pada kedua service; app pulih otomatis dalam 2 detik saat crash. |
| **7** | **Keamanan .env dan .env.example** | Kredensial disimpan dalam `.env` lokal/server dengan permission 600. Template non-rahasia disajikan pada `.env.example`. File `.env` masuk dalam `.gitignore` dan `.dockerignore`. | [.env.example](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/.env.example)<br/>[.gitignore](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/.gitignore) | Git status audit memastikan `.env` tidak ter-staging. | **PASS** | `.env` terisolasi dari Git dan Image; tidak ada password bocor. |
| **8** | **Deployment Azure VM yang dapat diakses melalui IP publik** | Aplikasi berjalan di Azure VM (`edo-praktikum2`, `70.153.150.99`) pada port 80 dan dapat diakses dari browser internet. | [evidence/03-public-access/](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/03-public-access/) | Akses HTTP `http://70.153.150.99:80` dan verifikasi visual UI. | **PASS** | Terverifikasi live di Azure VM `edo-praktikum2` pada `http://70.153.150.99`. |

---

## Matriks 2: Tujuh (7) Bukti Pengujian Wajib Asprak

| No. | Nama Bukti Pengujian | Bentuk Artefak | Lokasi File Artefak | Status Ketersediaan |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Struktur Project & Konfigurasi** | Teks Pohon Direktori & Screenshot GitHub | [`evidence/01-project-structure/project_structure.txt`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/01-project-structure/project_structure.txt)<br/>[`evidence/01-project-structure/bukti_01_github_project_structure.png`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/01-project-structure/bukti_01_github_project_structure.png) | **LENGKAP** |
| **2** | **Status Container di Azure VM** | Output Terminal `docker compose ps` | [`evidence/02-container-status/docker_compose_ps.txt`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/02-container-status/docker_compose_ps.txt) | **LOG RUNTIME TERSEDIA** *(Screenshot visual terminal SSH dapat diambil saat demo bila diminta)* |
| **3** | **Aplikasi via Public IP** | Screenshot Browser Web UI Fullscreen | [`evidence/03-public-access/student_task_manager_live.png`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/03-public-access/student_task_manager_live.png) | **LENGKAP** |
| **4** | **Halaman Overview Azure Portal** | Screenshot Portal Azure Running & Stopped | [`evidence/04-azure-overview/azure_vm_running_overview.png`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/04-azure-overview/azure_vm_running_overview.png)<br/>[`evidence/04-azure-overview/azure_vm_stopped_deallocated.png`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/04-azure-overview/azure_vm_stopped_deallocated.png) | **LENGKAP** |
| **5** | **Uji Persistensi Data Database** | Screenshot Web UI Pasca Restart & Log Terminal | [`evidence/05-data-persistence/bukti_05_uji_persistensi_data.png`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/05-data-persistence/bukti_05_uji_persistensi_data.png)<br/>[`evidence/05-data-persistence/persistence_test_log.txt`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/05-data-persistence/persistence_test_log.txt) | **LENGKAP** |
| **6** | **Keamanan Network Database** | JSON Inspect Network & Log Socket Hardening | [`evidence/06-network-security/network_inspect.json`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/06-network-security/network_inspect.json)<br/>[`evidence/06-network-security/docker_socket_security.txt`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/06-network-security/docker_socket_security.txt) | **LOG RUNTIME TERSEDIA** *(Screenshot visual terminal SSH dapat diambil saat demo bila diminta)* |
| **7** | **Restart Container & Simulasi Crash** | JSON Inspect Policy & Log Runtime Crash SIGKILL | [`evidence/07-restart-test/restart_policy.json`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/07-restart-test/restart_policy.json)<br/>[`evidence/07-restart-test/runtime_crash_restart_proof.txt`](file:///P:/Semester%205/Komputasi%20awan/Week%206/Student-Task-Manager/evidence/07-restart-test/runtime_crash_restart_proof.txt) | **LOG RUNTIME TERSEDIA** *(Screenshot visual terminal SSH dapat diambil saat demo bila diminta)* |

---

## Keterangan Status:
- **LENGKAP:** Bukti memiliki berkas tangkapan layar visual (`.png`) autentik dan/atau berkas data yang relevan.
- **LOG RUNTIME TERSEDIA:** Pengujian runtime nyata telah berhasil dijalankan pada Azure VM dengan rekaman output terminal dan inspect JSON yang tersimpan utuh di repositori. Tangkapan visual layar SSH dapat ditambahkan apabila asprak mewajibkan visual terminal window secara khusus.
