# Status Akhir Proyek (Final Engineering Status Report)

**Nama Proyek:** Student Task Manager (Cloud Docker Edition)  
**Mata Kuliah:** Komputasi Awan (Praktikum 2 Tugas Individu)  
**Mahasiswa:** Allfridho Prima Anjaynata Saragi (NIM: 102062400045)  
**Tanggal Laporan:** 26 Oktober 2026  
**Status Evaluasi:** SELESAI & TERVERIFIKASI PENUH  

---

## 1. Delapan (8) Ketentuan Wajib Asprak

1. **Dockerfile sendiri:** Multi-stage custom Dockerfile (`deps` + `runner`), base image resmi `node:20-alpine`, non-root user `node`. (Status: **PASS**)
2. **Compose minimal dua service:** Orkestrasi service `app` (Express.js) dan `database` (PostgreSQL 16) via `compose.yaml`. (Status: **PASS**)
3. **Internal network database:** Database terisolasi pada network `student_task_backend` dengan `internal: true`, tanpa mapping port ke host. (Status: **PASS**)
4. **Persistent volume:** Named volume `postgres_data` terpasang di `/var/lib/postgresql/data`; data terbukti utuh pasca down/up. (Status: **PASS**)
5. **Database healthcheck dan depends_on condition service_healthy:** Healthcheck `pg_isready` aktif pada database; service `app` menunggu kondisi healthy. (Status: **PASS**)
6. **Restart unless-stopped pada setiap service utama:** Kebijakan `unless-stopped` aktif; terbukti auto-restart dalam 2 detik saat kernel SIGKILL crash. (Status: **PASS**)
7. **Keamanan .env dan .env.example:** Template aman non-rahasia pada `.env.example`, kredensial `.env` dilindungi izin 600 dan dikecualikan dari Git. (Status: **PASS**)
8. **Deployment Azure VM yang dapat diakses melalui IP publik:** Berjalan stabil pada Azure VM `edo-praktikum2` di `http://70.153.150.99`. (Status: **PASS**)

---

## 2. Status Transparansi Tujuh (7) Bukti Pengujian

| No. Bukti | Nama Bukti Pengujian | Bentuk Bukti yang Tersedia | Status Kelengkapan |
| :---: | :--- | :--- | :---: |
| **Bukti 1** | Struktur Project & Konfigurasi | Teks Pohon Direktori & Screenshot GitHub | **LENGKAP** (`project_structure.txt`, `bukti_01_github_project_structure.png`) |
| **Bukti 2** | Status Container di Azure VM | Log Terminal `docker compose ps` | **LOG RUNTIME TERSEDIA** (`docker_compose_ps.txt`) |
| **Bukti 3** | Akses Aplikasi via Public IP | Screenshot Browser Web UI Fullscreen | **LENGKAP** (`student_task_manager_live.png`) |
| **Bukti 4** | Halaman Overview Azure Portal | Screenshot Portal Running & Stopped | **LENGKAP** (`azure_vm_running_overview.png`, `azure_vm_stopped_deallocated.png`) |
| **Bukti 5** | Uji Persistensi Data Database | Screenshot Web UI Pasca Restart & Log | **LENGKAP** (`bukti_05_uji_persistensi_data.png`, `persistence_test_log.txt`) |
| **Bukti 6** | Keamanan Network Database | Inspect JSON & Log Socket Hardening 660 | **LOG RUNTIME TERSEDIA** (`network_inspect.json`, `docker_socket_security.txt`) |
| **Bukti 7** | Kebijakan Restart Container | Inspect Policy & Log Runtime Crash SIGKILL | **LOG RUNTIME TERSEDIA** (`restart_policy.json`, `runtime_crash_restart_proof.txt`) |

*Catatan:* Seluruh pengujian teknis pada Bukti 2, 6, dan 7 telah dieksekusi secara nyata pada runtime Azure VM dan log output aslinya tersimpan di repositori. Apabila asisten praktikum mewajibkan tangkapan layar jendela grafis terminal SSH tambahan untuk Bukti 2, 6, dan 7, tangkapan layar tersebut dapat diambil saat sesi demonstrasi langsung dengan menyalakan VM kembali.

---

## 3. Kondisi Terkini Infrastruktur Cloud (Azure VM)
- **Virtual Machine:** `edo-praktikum2` di Resource Group `rg-praktikum2-edo`.
- **Status Operasional:** **`Stopped (deallocated)`** (Telah dimatikan via Azure Portal untuk menghentikan tagihan komputasi dan melindungi saldo kredit *Azure for Students*).
- **Integritas Data:** Seluruh file proyek di `/home/azureuser/Student-Task-Manager` dan volume `postgres_data` serta volume `portify_mysql_data` tersimpan aman di disk VM.
