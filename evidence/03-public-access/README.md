# BUKTI 3: APLIKASI MELALUI PUBLIC IP

## 1. Perintah / Tindakan Pengambilan Bukti
Buka browser (Google Chrome, Microsoft Edge, dll.) dan kunjungi:
```text
http://<IP_PUBLIC_VM>
```
*(Contoh: `http://20.198.xxx.xxx`)*

## 2. Kondisi yang Wajib Terlihat dalam Screenshot
- Browser address bar terlihat jelas memuat URL IP publik Azure VM.
- Halaman web **Student Task Manager** terbuka penuh tanpa connection refused atau error 500.
- Indikator status sistem hijau: `Online (PostgreSQL Healthy)`.
- Metrik dashboard statistik dan kartu tugas kuliah terender dengan rapi.

## 3. Status Bukti
- **Status:** MENUNGGU EKSEKUSI DI AZURE VM (Dijalankan saat VM dinyalakan oleh pengguna).
- **Target File Screenshot:** `evidence/03-public-access/bukti_03_akses_public_ip.png`
