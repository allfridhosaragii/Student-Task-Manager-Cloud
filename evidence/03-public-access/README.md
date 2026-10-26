# BUKTI 3: AKSES APLIKASI MELALUI PUBLIC IP AZURE VM

## 1. Deskripsi Bukti
Bukti ini menunjukkan antarmuka web Student Task Manager yang dapat diakses secara publik melalui internet menggunakan IP Publik Azure Virtual Machine (`70.153.150.99`) pada port standar HTTP (80).

## 2. Berkas Bukti yang Tersedia di Folder Ini
- **`student_task_manager_live.png`**: Tangkapan layar browser layar penuh beresolusi tinggi yang mengakses `http://70.153.150.99/` secara langsung.

## 3. Kondisi yang Tervalidasi dalam Screenshot
- **URL Akses**: `http://70.153.150.99/` terbuka di browser tanpa pesan error koneksi (*connection refused*) atau error 500.
- **Indikator Sistem**: Menampilkan status hijau `Online (PostgreSQL Healthy - 1ms)`, membuktikan komunikasi antar-kontainer melalui jaringan internal `student_task_backend` berjalan dengan latensi rendah.
- **Dashboard Statistik**: Metrik Total Tugas (5), Menunggu (2), Sedang Dikerjakan (2), dan Selesai (1) terisi secara dinamis dari database PostgreSQL.
- **Daftar Tugas Akademik**: Kartu-kartu penugasan kuliah ditampilkan dengan tingkat prioritas dan deadline yang sesuai.

## 4. Status Bukti
- **Status:** TERVERIFIKASI & LENGKAP (Tangkapan layar browser aktual tersedia).
