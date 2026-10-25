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
