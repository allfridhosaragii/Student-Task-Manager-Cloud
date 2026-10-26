# BUKTI 6: KEAMANAN NETWORK DATABASE DAN HARDENING DOCKER SOCKET

## 1. Deskripsi Bukti
Bukti ini memverifikasi dua aspek keamanan kritis:
1. **Isolasi Jaringan Database**: Layanan basis data PostgreSQL (`student-task-db`) berjalan pada jaringan kustom dengan atribut `internal: true`, tanpa membuka port ke host VM maupun internet.
2. **Hardening Docker Socket**: Socket daemon Docker (`/var/run/docker.sock`) dilindungi dengan hak akses `root:docker` (660), mencegah akses *world-writable* dari pengguna tidak berwenang.

## 2. Berkas Bukti yang Tersedia di Folder Ini
1. **`network_inspect.json`**: Hasil inspeksi JSON Docker Network `student_task_backend` yang membuktikan atribut `"Internal": true`.
2. **`docker_socket_security.txt`**: Catatan audit dan verifikasi perbaikan izin socket Docker dari 666 menjadi 660 (`srw-rw---- 1 root docker`) dan keanggotaan grup `azureuser` pada grup `docker`.

## 3. Hasil Pengujian Aktual
- **Inspeksi Port Database**:
  `docker compose ps database` hanya menampilkan `5432/tcp` internal tanpa pemetaan ke host (`0.0.0.0:5432`).
- **Uji Penolakan Koneksi Host**:
  Percobaan koneksi `nc -z -v 127.0.0.1 5432` dari terminal host menghasilkan pesan:
  `Connection refused` (Aman, koneksi langsung ditolak).
- **Integritas Docker Socket**:
  Hak akses diverifikasi `660` dan dieksekusi langsung oleh `azureuser` tanpa `sudo`.

## 4. Status Bukti
- **Status:** TERVERIFIKASI RUNTIME (Inspect JSON dan log audit keamanan socket tersedia).
- *Catatan:* Tangkapan layar grafis jendela terminal SSH dapat diambil tambahan saat sesi demonstrasi langsung kepada asisten praktikum dengan menyalakan VM kembali.
