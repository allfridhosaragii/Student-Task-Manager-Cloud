# BUKTI 5: UJI PERSISTENSI DATA DATABASE (NAMED VOLUME)

## 1. Deskripsi Bukti
Bukti ini menunjukkan bahwa data yang disimpan dalam database PostgreSQL pada kontainer `student-task-db` tetap aman dan persisten meskipun kontainer dimatikan dan dihapus menggunakan perintah `docker compose down`, kemudian dinyalakan kembali dengan `docker compose up -d`.

## 2. Berkas Bukti yang Tersedia di Folder Ini
1. **`bukti_05_uji_persistensi_data.png`**: Tangkapan layar autentik dari antarmuka web Student Task Manager yang diakses langsung melalui IP Publik Azure VM (`http://70.153.150.99/`), membuktikan tugas uji persistensi `UJI-PERSISTENSI-DOCKER-1792953453` (ID: #5) tetap tersimpan utuh dengan status indikator `Online (PostgreSQL Healthy - 1ms)`.
2. **`persistence_test_log.txt`**: Catatan eksekusi lengkap tahapan pengujian (HTTP POST penambahan tugas, `docker compose down`, `docker compose up -d`, dan verifikasi keberadaan data via HTTP GET).

## 3. Rincian Prosedur Pengujian Aktual
1. **Input Data**: Tugas unik `UJI-PERSISTENSI-DOCKER-1792953453` dibuat melalui API/UI pada port 80 Azure VM.
2. **Penghancuran Kontainer**: Dijalankan `docker compose down` pada Azure VM. Kontainer `student-task-app` dan `student-task-db` dihapus dari memory dan runtime host.
3. **Penyalaan Ulang Kontainer**: Dijalankan `docker compose up -d`. Kontainer baru dibuat dan diinisialisasi.
4. **Verifikasi Data**: Request ke `http://70.153.150.99/api/tasks/5` mengembalikan status `200 OK` dengan seluruh field data lengkap tanpa kerusakan.

## 4. Status Bukti
- **Status:** TERVERIFIKASI & LENGKAP (Tangkapan layar visual aplikasi live dan log terminal pengujian tersedia).
