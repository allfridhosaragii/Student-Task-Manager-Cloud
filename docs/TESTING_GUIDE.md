# Panduan Pengujian & Pengambilan 7 Bukti Wajib Praktikum

Dokumen ini memuat prosedur resmi pengujian untuk menghasilkan dan memverifikasi **Tujuh Bukti Pengujian Wajib** yang disyaratkan oleh asisten praktikum Komputasi Awan.

---

## Ringkasan Prosedur 7 Bukti Wajib Asprak

| No. Bukti | Nama Bukti | Lokasi Eksekusi | Perintah / Tindakan | Berkas Bukti yang Tersedia | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **1** | Struktur Project & Konfigurasi | Host Lokal / GitHub | `tree`, `cat Dockerfile`, `compose.yaml` | `evidence/01-project-structure/project_structure.txt`<br/>`evidence/01-project-structure/bukti_01_github_project_structure.png` | **LENGKAP** |
| **2** | Status Container di Azure VM | Terminal SSH VM | `docker compose ps` | `evidence/02-container-status/docker_compose_ps.txt` | **LOG RUNTIME TERSEDIA** |
| **3** | Akses Aplikasi via Public IP | Browser Laptop | Buka `http://70.153.150.99` | `evidence/03-public-access/student_task_manager_live.png` | **LENGKAP** |
| **4** | Halaman Overview Azure Portal | Browser Laptop | Portal Azure -> VM `edo-praktikum2` | `evidence/04-azure-overview/azure_vm_running_overview.png`<br/>`evidence/04-azure-overview/azure_vm_stopped_deallocated.png` | **LENGKAP** |
| **5** | Uji Persistensi Data Database | Browser & Terminal | POST task unik -> `down` -> `up -d` -> verifikasi GET | `evidence/05-data-persistence/bukti_05_uji_persistensi_data.png`<br/>`evidence/05-data-persistence/persistence_test_log.txt` | **LENGKAP** |
| **6** | Keamanan Network Database | Terminal SSH VM | `docker network inspect`, `nc 5432`, socket audit | `evidence/06-network-security/network_inspect.json`<br/>`evidence/06-network-security/docker_socket_security.txt` | **LOG RUNTIME TERSEDIA** |
| **7** | Kebijakan Restart Container | Terminal SSH VM | `docker inspect RestartPolicy`, SIGKILL crash test | `evidence/07-restart-test/restart_policy.json`<br/>`evidence/07-restart-test/runtime_crash_restart_proof.txt` | **LOG RUNTIME TERSEDIA** |

---

## Panduan Detail Tiap Bukti

### BUKTI 1: STRUKTUR PROJECT DAN KONFIGURASI
1. **Langkah Verifikasi:**
   Periksa pohon berkas repositori GitHub atau direktori lokal:
   ```bash
   Get-ChildItem -Recurse -Depth 2 -Exclude "node_modules", ".git"
   cat Dockerfile
   cat compose.yaml
   ```
2. **Kondisi yang Tervalidasi:**
   - Folder lengkap (`src/`, `public/`, `docs/`, `tests/`, `scripts/`, `evidence/`).
   - File `Dockerfile` multi-stage build dan non-root user `node`.
   - File `.env` terproteksi dan tidak ter-commit ke Git.
3. **Artefak:** `evidence/01-project-structure/`

---

### BUKTI 2: STATUS CONTAINER DI AZURE VM
1. **Langkah Verifikasi:**
   Di terminal SSH Azure VM (`edo-praktikum2`):
   ```bash
   cd ~/Student-Task-Manager
   docker compose ps
   ```
2. **Kondisi yang Tervalidasi:**
   - Container `student-task-app` berstatus `Up (healthy)` dengan port `0.0.0.0:80->3000/tcp`.
   - Container `student-task-db` berstatus `Up (healthy)` dengan port `5432/tcp` terisolasi internal.
3. **Artefak:** `evidence/02-container-status/docker_compose_ps.txt`

---

### BUKTI 3: APLIKASI MELALUI PUBLIC IP
1. **Langkah Verifikasi:**
   Buka browser dan akses alamat IP publik:
   ```text
   http://70.153.150.99
   ```
2. **Kondisi yang Tervalidasi:**
   - Address bar memuat URL `http://70.153.150.99`.
   - Aplikasi Student Task Manager terbuka penuh tanpa error koneksi.
   - Indikator kesehatan sistem berstatus hijau: `Online (PostgreSQL Healthy - 1ms)`.
3. **Artefak:** `evidence/03-public-access/student_task_manager_live.png`

---

### BUKTI 4: HALAMAN OVERVIEW AZURE
1. **Langkah Verifikasi:**
   Buka portal Microsoft Azure di `https://portal.azure.com` -> Virtual machines -> `edo-praktikum2`.
2. **Kondisi yang Tervalidasi:**
   - Nama VM: `edo-praktikum2`, Resource Group: `rg-praktikum2-edo`.
   - Wilayah: `Indonesia Central`.
   - Public IP: `70.153.150.99` (identik dengan Bukti 3).
   - Bukti status `Running` dan konfirmasi status `Stopped (deallocated)` saat penghematan kredit.
3. **Artefak:** `evidence/04-azure-overview/`

---

### BUKTI 5: UJI PERSISTENSI DATA
1. **Langkah Verifikasi:**
   - Tambahkan tugas unik `UJI-PERSISTENSI-DOCKER-1792953453` via API port 80.
   - Hentikan kontainer dengan `docker compose down` (tanpa flag `-v`).
   - Nyalakan kembali kontainer dengan `docker compose up -d`.
   - Periksa ketersediaan data via HTTP GET `/api/tasks/5`.
2. **Kondisi yang Tervalidasi:**
   - Data tugas ID #5 tetap tersimpan utuh di PostgreSQL membuktikan named volume `postgres_data` aktif.
3. **Artefak:**
   - `evidence/05-data-persistence/bukti_05_uji_persistensi_data.png`
   - `evidence/05-data-persistence/persistence_test_log.txt`

---

### BUKTI 6: KEAMANAN NETWORK DATABASE (ISOLASI INTERNAL)
1. **Langkah Verifikasi:**
   - Inspeksi port database: `docker compose ps database` (hanya `5432/tcp` internal).
   - Inspeksi atribut internal: `docker network inspect student_task_backend` (`"Internal": true`).
   - Uji penolakan koneksi host: `nc -z -v 127.0.0.1 5432` (`Connection refused`).
   - Audit izin Docker socket: `ls -la /var/run/docker.sock` (`660 root:docker`).
2. **Artefak:**
   - `evidence/06-network-security/network_inspect.json`
   - `evidence/06-network-security/docker_socket_security.txt`

---

### BUKTI 7: VERIFIKASI RESTART CONTAINER & RUNTIME CRASH
1. **Langkah Verifikasi:**
   - Inspeksi kebijakan restart: `docker inspect student-task-app --format '{{json .HostConfig.RestartPolicy}}'`.
   - Simulasi crash proses nyata pada level kernel: `sudo kill -9 <PID_NodeJS>`.
   - Verifikasi pemulihan: Docker supervisor mendeteksi kegagalan dan me-restart kontainer dalam 2 detik (`RestartCount` bertambah dari 0 ke 1, PID baru dibuat, status kembali `healthy`).
2. **Artefak:**
   - `evidence/07-restart-test/restart_policy.json`
   - `evidence/07-restart-test/runtime_crash_restart_proof.txt`
