# BUKTI 6: KEAMANAN NETWORK DATABASE

## 1. Perintah Pengambilan Bukti
Jalankan di terminal SSH Azure VM:
```bash
cd ~/Student-Task-Manager

# 1. Periksa published port database
docker compose ps database

# 2. Periksa atribut internal pada network backend
docker network inspect student_task_backend | grep -E "Internal|Name"

# 3. Uji koneksi dari host ke port 5432 (harus ditolak/connection refused)
nc -z -v -w 2 127.0.0.1 5432 2>&1 || echo "Koneksi ke port 5432 ditolak (Aman)"
```

## 2. Kondisi yang Wajib Terlihat dalam Screenshot
- Baris database pada `docker compose ps` HANYA menampilkan port `5432/tcp` internal tanpa ada pemetaan `0.0.0.0:5432->5432`.
- Atribut `"Internal": true` pada inspeksi jaringan Docker backend.
- Pesan koneksi ditolak (*connection refused*) saat mencoba menghubungi port 5432 dari luar container.

## 3. Status Bukti
- **Status:** MENUNGGU EKSEKUSI DI AZURE VM (Dijalankan saat VM dinyalakan oleh pengguna).
- **Target File Screenshot:** `evidence/06-network-security/bukti_06_keamanan_network_database.png`
