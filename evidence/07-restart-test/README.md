# BUKTI 7: VERIFIKASI KEBIJAKAN RESTART KONTENDIR (UNLESS-STOPPED & RUNTIME CRASH)

## 1. Deskripsi Bukti
Bukti ini mengonfigurasi dan menguji perilaku kebijakan `restart: unless-stopped` pada Docker Compose. Pengujian dilakukan tidak hanya melalui pembacaan deklarasi statis, melainkan melalui **simulasi crash proses nyata pada level kernel** menggunakan sinyal `SIGKILL` (`kill -9`) langsung ke PID aplikasi.

## 2. Berkas Bukti yang Tersedia di Folder Ini
1. **`restart_policy.json`**: Hasil ekstraksi JSON konfigurasi `HostConfig.RestartPolicy` untuk service `app` dan `database` yang menunjukkan `{"Name": "unless-stopped"}`.
2. **`runtime_crash_restart_proof.txt`**: Catatan verifikasi perilaku crash dan pemulihan mandiri runtime (perubahan status PID, kenaikan `RestartCount` dari 0 ke 1, pemulihan status `healthy`, dan integritas data PostgreSQL).

## 3. Hasil Pengujian Runtime Aktual
- **Status Sebelum Crash**:
  `PID: 17734`, `RestartCount: 0`, `Status: running (healthy)`.
- **Eksekusi Crash**:
  Proses aplikasi dihentikan paksa dengan perintah `sudo kill -9 17734`.
- **Hasil Pemulihan Mandiri (Auto-Restart)**:
  Dalam waktu 2 detik, Docker daemon mendeteksi proses terminated dan langsung me-restart kontainer:
  `PID Baru: 18403`, `RestartCount: 1`, `Status: running (healthy)`.
- **Integritas Database**:
  Seluruh 5 tugas kuliah pada database PostgreSQL tetap tersimpan utuh dan API `/health` mengembalikan status `healthy (1ms)`.

## 4. Status Bukti
- **Status:** TERVERIFIKASI RUNTIME (Inspect JSON dan log empiris auto-restart tersedia).
- *Catatan:* Tangkapan layar grafis jendela terminal SSH dapat diambil tambahan saat sesi demonstrasi langsung kepada asisten praktikum dengan menyalakan VM kembali.
