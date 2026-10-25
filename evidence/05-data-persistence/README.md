# BUKTI 5: UJI PERSISTENSI DATA

## 1. Prosedur Pengambilan Bukti
1. Buka aplikasi di browser `http://<IP_PUBLIC_VM>`.
2. Klik tombol **Tambah Tugas**.
3. Masukkan data unik:
   - Judul: `UJI-PERSISTENSI-DOCKER`
   - Mata Kuliah: `Komputasi Awan`
   - Deadline: (tanggal bebas)
   - Prioritas: `Tinggi (High)`
   - Status: `Sedang Dikerjakan`
4. Klik **Simpan Tugas**. Ambil screenshot 1 (kondisi tugas tersimpan di antarmuka).
5. Di terminal SSH VM, jalankan:
   ```bash
   cd ~/Student-Task-Manager
   # Matikan kontainer (JANGAN gunakan -v)
   docker compose down
   # Nyalakan kembali kontainer
   docker compose up -d
   ```
6. Tunggu 5 detik hingga PostgreSQL healthy, lalu refresh browser `http://<IP_PUBLIC_VM>`.
7. Ambil screenshot 2 (tugas `UJI-PERSISTENSI-DOCKER` tetap ada dan utuh).

## 2. Kondisi yang Wajib Terlihat dalam Screenshot
- Screenshot 1: Tugas `UJI-PERSISTENSI-DOCKER` berhasil dibuat di UI.
- Terminal output: Eksekusi `docker compose down` dan `docker compose up -d`.
- Screenshot 2: Setelah kontainer dimatikan dan dibuat ulang, tugas `UJI-PERSISTENSI-DOCKER` masih tampil di daftar tugas.

## 3. Status Bukti
- **Status:** MENUNGGU EKSEKUSI DI AZURE VM (Dijalankan saat VM dinyalakan oleh pengguna).
- **Target File Screenshot:**
  - `evidence/05-data-persistence/bukti_05a_sebelum_container_down.png`
  - `evidence/05-data-persistence/bukti_05b_setelah_container_up.png`
