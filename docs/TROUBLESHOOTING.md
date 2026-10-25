# Panduan Pemecahan Masalah (Troubleshooting Guide)

Dokumen ini memuat daftar kendala teknis yang umum terjadi selama instalasi, build, deployment, dan pengujian kontainer Docker pada Azure VM beserta langkah solusi konkretnya.

---

## 1. Kendala Akses Website (Browser Menampilkan "Connection Refused")

### Gejala:
Browser tidak dapat membuka `http://<IP_PUBLIC_VM>` dan menampilkan pesan *Connection Refused* atau *ERR_CONNECTION_TIMED_OUT*.

### Kemungkinan Penyebab & Solusi:
1. **Status VM Azure sedang Deallocated/Stopped:**  
   - Buka Azure Portal -> Virtual Machines -> `edo-praktikum2`.  
   - Pastikan status adalah **Running**. Jika Stopped, klik tombol **Start**.
2. **IP Publik Azure VM Berubah:**  
   - Jika VM pernah dimatikan tanpa reservasi Static IP, alamat IP publik akan berganti saat dinyalakan kembali.  
   - Periksa IP terbaru di halaman Overview Azure Portal dan gunakan IP baru tersebut.
3. **Port 80 Belum Dibuka pada Network Security Group (NSG):**  
   - Masuk ke Azure Portal -> VM -> **Networking**.  
   - Tambahkan Inbound security rule: Source: `Any`, Destination: `Any`, Destination port ranges: `80`, Protocol: `TCP`, Action: `Allow`.
4. **Kontainer Aplikasi Belum Berjalan:**  
   - Masuk ke SSH VM dan periksa: `docker compose ps`.  
   - Jika kontainer mati, jalankan: `docker compose up -d`.

---

## 2. Kendala Healthcheck Database ("service_healthy" Timeout)

### Gejala:
Saat menjalankan `docker compose up -d`, service `app` tertahan dengan pesan *waiting for database to be healthy* lalu mengalami timeout.

### Kemungkinan Penyebab & Solusi:
1. **Kredensial Tidak Cocok antara App dan Database:**  
   - Periksa file `.env` di VM. Pastikan `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` sama persis dengan `POSTGRES_USER`, `POSTGRES_PASSWORD`, dan `POSTGRES_DB`.
2. **Kapasitas Disk Host Penuh:**  
   - Jalankan `df -h` di terminal VM. Jika disk 100% penuh, bersihkan image lama: `docker system prune -af`.
3. **Periksa Log Database:**  
   - Jalankan: `docker compose logs database`.  
   - Cari baris error PostgreSQL (misalnya kesalahan izin folder atau inisialisasi volume).

---

## 3. Konflik Port 80 pada Host Linux

### Gejala:
Pesan error saat menjalankan docker compose:  
`Error response from daemon: driver failed programming external connectivity on endpoint student-task-app: Bind for 0.0.0.0:80 failed: port is already allocated`

### Solusi:
1. Periksa proses apa yang sedang menggunakan port 80 di host:
   ```bash
   sudo ss -tulpn | grep :80
   # atau
   sudo lsof -i :80
   ```
2. Jika Apache2 atau Nginx bawaan Ubuntu sedang aktif di background:
   ```bash
   sudo systemctl stop apache2 nginx
   sudo systemctl disable apache2 nginx
   ```
3. Jalankan kembali: `docker compose up -d`.

---

## 4. Kendala Akses SSH ("Permission Denied (publickey)")

### Gejala:
Perintah `ssh -i ~/.ssh/id_ed25519 azureuser@<IP>` ditolak oleh server.

### Solusi:
1. Pastikan path file private key benar: `$HOME\.ssh\id_ed25519`.
2. Pastikan username SSH adalah `azureuser` (sesuai konfigurasi Praktikum 2).
3. Pastikan izin akses file private key di Windows tidak terbuka untuk *Everyone* (hanya akun pengguna Windows Anda).

---

## 5. Menghapus dan Memulai Ulang Lingkungan Bersih (Fresh Restart)

Jika Anda ingin mereset kontainer ke kondisi awal tanpa menghapus data volume:
```bash
docker compose down
docker compose up -d --build
```

Jika Anda ingin mereset seluruh database beserta volumenya (PERHATIAN: menghapus semua data tugas):
```bash
docker compose down -v
docker compose up -d --build
```

---

## 6. Kendala SSH Banner Exchange Timeout & Azure VM Agent Not Ready (Systemd / Dbus Deadlock)

### Gejala:
1. `Test-NetConnection <IP_VM> -Port 22` berhasil (`TcpTestSucceeded: True`).
2. `ssh -vvv azureuser@<IP_VM>` menampilkan: `Connection established` lalu `Connection timed out during banner exchange`.
3. Azure Portal menampilkan: `VM Agent Status: Not Ready`, `Agent Version: Unknown`.
4. Azure Run Command menampilkan: `Eksekusi skrip sedang berlangsung...` tanpa henti.
5. Port 80 web server (Nginx) tetap merespons HTTP request secara normal.

### Analisis Akar Masalah:
- Kernel Linux dan TCP stack VM dalam keadaan aktif.
- Pada Ubuntu 24.04 LTS, OpenSSH menggunakan `ssh.socket` (systemd socket activation). Port 22 menerima koneksi TCP pada level kernel, namun proses worker `sshd` (`ssh@.service`) gagal di-spawn karena dbus/systemd job manager mengalami deadlock atau hang akibat eksekusi background command sebelumnya.
- `walinuxagent` (Azure Guest Agent) juga terhenti karena gagal berkomunikasi dengan systemd, sehingga fabric Azure menandai VM Agent sebagai *Not Ready*.

### Solusi Pemulihan Aman (Non-Destruktif):
1. **Opsi 1 (Sangat Disarankan): Stop (Deallocate) & Start via Azure Portal**
   - Buka Azure Portal -> Virtual Machines -> `edo-praktikum2`.
   - Klik tombol **Stop** (Status akan berubah menjadi *Stopped (deallocated)*). Hal ini memaksa fabric Hyper-V mematikan hardware VM secara bersih dari luar OS tanpa bergantung pada skrip shutdown systemd yang macet.
   - Setelah status *Stopped*, klik **Start**.
   - VM akan boot ulang secara bersih, systemd dan walinuxagent akan aktif normal kembali, dan SSH banner exchange akan berfungsi.
   - *Catatan:* Periksa kembali Public IP setelah start. Jika IP dinamis berubah, perbarui argumen IP saat deploy.
2. **Opsi 2: Azure Serial Console (Hypervisor TTY)**
   - Buka Azure Portal -> `edo-praktikum2` -> menu kiri bagian **Help** -> **Serial Console**.
   - Tekan Enter pada terminal serial `/dev/ttyS0` dan login dengan akun `azureuser`.
   - Jalankan pemulihan service:
     ```bash
     sudo systemctl restart ssh
     sudo systemctl restart walinuxagent
     ```
   - Periksa status: `systemctl status ssh` dan uji kembali koneksi SSH dari Windows.

