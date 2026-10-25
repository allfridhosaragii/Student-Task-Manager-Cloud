# Panduan Deployment Azure Virtual Machine

Panduan komprehensif ini menjelaskan langkah demi langkah pelaksanaan deployment proyek **Student Task Manager** ke Microsoft Azure Virtual Machine milik mahasiswa (`edo-praktikum2`).

---

## 1. Informasi Lingkungan Virtual Machine

Berdasarkan konfigurasi infrastruktur Praktikum 2 sebelumnya:
- **Nama VM:** `edo-praktikum2`
- **Resource Group:** `rg-praktikum2-edo`
- **Region:** `Indonesia Central`
- **Sistem Operasi:** Ubuntu Server 24.04 LTS
- **Username SSH:** `azureuser`
- **Kunci Autentikasi:** Pasangan kunci SSH `ed25519` di laptop mahasiswa (`~/.ssh/id_ed25519`)
- **Port Jaringan Terbuka (NSG):** Port 22 (SSH) dan Port 80 (HTTP).  
  *Catatan Penting: Port 5432 (PostgreSQL) TIDAK BOLEH dibuka pada NSG demi kepatuhan Ketentuan 3.*

---

## 2. Langkah Persiapan Sebelum Deployment

1. **Nyalakan Virtual Machine:**
   - Buka [Azure Portal](https://portal.azure.com/).
   - Masuk ke menu **Virtual Machines** -> pilih `edo-praktikum2`.
   - Pastikan status VM adalah **Running**. Jika masih *Stopped (deallocated)*, klik tombol **Start**.
   - Catat **Public IP address** terbaru VM Anda (misal: `20.xxx.xxx.xxx`).

2. **Periksa Network Security Group (NSG):**
   - Di halaman VM, pilih **Networking** (atau **Network settings**).
   - Pastikan terdapat Inbound Port Rule untuk:
     - Port `22` (SSH) — Action: Allow
     - Port `80` (HTTP) — Action: Allow
   - Pastikan TIDAK ADA aturan yang mengizinkan port `5432` dari internet.

---

## 3. Pengemasan & Pengiriman Kode Program ke VM (Clean Transfer)

Untuk mencegah pengiriman folder `node_modules` (ratusan MB binary Windows yang tidak kompatibel di Linux), riwayat `.git`, maupun file rahasia `.env`, gunakan berkas arsip terkompresi bersih:

1. **Kemas Proyek di Laptop (PowerShell):**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "P:\Semester 5\Komputasi awan\Week 6\Student-Task-Manager\scripts\package-project.ps1"
   ```
   *Skrip ini menghasilkan berkas `student-task-manager.tar.gz` (~62 KB) yang telah mengecualikan node_modules, .git, dan .env.*

2. **Kirim Berkas Arsip ke Azure VM:**
   ```powershell
   scp -i $HOME\.ssh\id_ed25519 "P:\Semester 5\Komputasi awan\Week 6\Student-Task-Manager\student-task-manager.tar.gz" azureuser@<IP_PUBLIC_VM>:~/
   ```

---

## 4. Eksekusi Deployment di Azure VM Melalui SSH

1. **Masuk ke Sesi SSH VM:**
   ```powershell
   ssh -i $HOME\.ssh\id_ed25519 azureuser@<IP_PUBLIC_VM>
   ```

2. **Ekstrak Berkas Proyek di Direktori Aman:**
   ```bash
   mkdir -p ~/Student-Task-Manager
   tar -xzf ~/student-task-manager.tar.gz -C ~/Student-Task-Manager
   cd ~/Student-Task-Manager
   chmod +x scripts/*.sh
   ```

3. **Jalankan Skrip Deployment Otomatis dengan Parameter IP Publik:**
   ```bash
   ./scripts/deploy-azure.sh <IP_PUBLIC_VM>
   ```
   *Skrip ini secara otomatis:*
   - Memvalidasi format IPv4 dari Azure Portal yang Anda masukkan.
   - Mengonfigurasi `APP_URL=http://<IP_PUBLIC_VM>` pada file `.env` server.
   - Menghasilkan password database acak 24 karakter yang kuat dan menerapkan izin akses aman `chmod 600 .env`.
   - Memvalidasi sintaks Docker Compose tanpa menghapus volume atau mereset database lama.
   - Membangun image dan menyalakan kontainer `app` dan `database`.
   - Memantau kondisi startup hingga kedua kontainer berstatus `healthy`.

---

## 5. Menjalankan Pengujian Integrasi Database & 7 Bukti Wajib di VM

Jalankan skrip verifikasi otomatis di terminal VM:

```bash
./scripts/verify-evidence.sh <IP_PUBLIC_VM>
```

Skrip ini akan mengeksekusi secara nyata:
1. **Bukti 1:** Memeriksa struktur project, Dockerfile, dan `compose.yaml`.
2. **Bukti 2:** Memeriksa status `docker compose ps` (kedua service `Up (healthy)`).
3. **Bukti 3:** Memeriksa konektivitas HTTP port 80 dan endpoint `/health`.
4. **Bukti 4:** Memberikan panduan pencocokan IP dan status Running pada Azure Portal.
5. **Uji Integrasi Database Sungguhan (Zero Mock):**  
   Menjalankan kontainer `test-runner` terisolasi pada internal network `student_task_backend`:
   ```bash
   docker compose --profile test run --rm test-runner
   ```
   *Pengujian ini mengeksekusi operasi CRUD nyata langsung ke database PostgreSQL tanpa pernah membuka port 5432 ke internet.*
6. **Bukti 5 (Persistensi Data):**  
   Menyimpan tugas baru `UJI-PERSISTENSI-DOCKER` -> menghentikan kontainer dengan `docker compose down` (tanpa `-v`) -> menyalakan kembali dengan `docker compose up -d` -> memverifikasi data tugas masih ada.
7. **Bukti 6 (Keamanan Network):**  
   Membuktikan `docker compose ps database` tidak memiliki port host, jaringan backend memiliki `"Internal": true`, dan koneksi lokal ke port 5432 ditolak.
8. **Bukti 7 (Restart Policy):**  
   Memeriksa `RestartPolicy` bernilai `unless-stopped` pada kedua kontainer.

---

## 6. Mengakses Website di Browser Laptop

Buka web browser dan kunjungi:
```text
http://<IP_PUBLIC_VM>
```
Website **Student Task Manager** akan langsung terbuka dengan indikator sistem online, dashboard statistik, dan daftar tugas kuliah siap pakai.

---

## 7. Prosedur Penghematan Kredit Azure (PENTING!)

Setelah seluruh pengujian dan pengambilan screenshot selesai:

1. Matikan kontainer secara rapi:
   ```bash
   cd ~/Student-Task-Manager
   docker compose down
   ```
2. **Deallocate Virtual Machine via Azure Portal:**
   - Masuk ke Azure Portal -> VM `edo-praktikum2` -> klik **Stop**.
   - Tunggu hingga status berubah menjadi **Stopped (deallocated)**.
   - Status ini menghentikan pemotongan biaya komputasi per jam pada saldo Azure for Students Anda.
