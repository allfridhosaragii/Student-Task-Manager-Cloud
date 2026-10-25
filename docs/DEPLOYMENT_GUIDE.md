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
  *Catatan: Port 5432 (PostgreSQL) TIDAK BOLEH dibuka pada NSG.*

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

## 3. Menghubungkan ke VM Melalui SSH

Buka PowerShell di laptop Anda dan jalankan perintah:

```powershell
ssh -i $HOME\.ssh\id_ed25519 azureuser@<IP_PUBLIC_VM>
```

Ganti `<IP_PUBLIC_VM>` dengan alamat IP publik aktual yang tertera di Azure Portal.

---

## 4. Pengiriman Kode Program ke VM

Anda dapat memilih salah satu dari dua metode berikut:

### Opsi A: Melalui Repository GitHub (Direkomendasikan)
Jika Anda telah membuat repository GitHub pribadi:
```bash
git clone https://github.com/<username>/Student-Task-Manager-Cloud.git ~/Student-Task-Manager
cd ~/Student-Task-Manager
```

### Opsi B: Transfer Langsung via SCP dari Windows
Jalankan perintah ini di PowerShell laptop Anda:
```powershell
scp -i $HOME\.ssh\id_ed25519 -r "P:\Semester 5\Komputasi awan\Week 6\Student-Task-Manager" azureuser@<IP_PUBLIC_VM>:~/Student-Task-Manager
```

---

## 5. Konfigurasi Lingkungan Server (.env)

Di dalam terminal SSH Ubuntu VM:

```bash
cd ~/Student-Task-Manager

# Buat file .env dari template resmi .env.example
cp .env.example .env

# Dapatkan IP publik otomatis dan masukkan ke .env
PUBLIC_IP=$(curl -s -4 ifconfig.me)
sed -i "s|http://<IP_PUBLIC_VM>|http://${PUBLIC_IP}|g" .env

# (Opsional) Sesuaikan password database jika diperlukan
nano .env
```

Pastikan variabel `APP_URL` menggunakan alamat IP publik aktual, misalnya `APP_URL=http://20.xxx.xxx.xxx`.

---

## 6. Menjalankan Aplikasi via Docker Compose

1. **Validasi Konfigurasi Compose:**
   ```bash
   docker compose config -q
   ```
   *Jika tidak muncul output error, konfigurasi dinyatakan valid.*

2. **Build Docker Image & Jalankan Service:**
   ```bash
   docker compose up -d --build
   ```

3. **Periksa Status Kontainer:**
   ```bash
   docker compose ps
   ```
   Hasil yang diharapkan:
   - `student-task-app`: Status `Up` (healthy) — Port `0.0.0.0:80->3000/tcp`
   - `student-task-db`: Status `Up` (healthy) — Port internal `5432/tcp` (tanpa mapping host)

4. **Periksa Log Eksekusi:**
   ```bash
   # Log aplikasi
   docker compose logs --tail=50 app

   # Log database PostgreSQL
   docker compose logs --tail=50 database
   ```

---

## 7. Pengujian Akses Website

Buka web browser di laptop Anda dan akses alamat:
```text
http://<IP_PUBLIC_VM>
```
Website **Student Task Manager** akan langsung terbuka dengan indikator sistem online, dashboard statistik, dan daftar tugas kuliah siap pakai.

---

## 8. Prosedur Penghematan Kredit Azure (PENTING!)

Akun mahasiswa memiliki kredit terbatas (*Azure for Students*). Setelah seluruh pengujian dan pengambilan screenshot laporan selesai:

1. Matikan kontainer secara rapi jika diperlukan:
   ```bash
   cd ~/Student-Task-Manager
   docker compose down
   ```
2. **Deallocate Virtual Machine via Azure Portal:**
   - Masuk ke Azure Portal -> VM `edo-praktikum2` -> klik **Stop**.
   - Tunggu hingga status berubah menjadi **Stopped (deallocated)**.
   - Status ini menghentikan pemotongan biaya komputasi per jam pada saldo Azure for Students Anda.
3. *Catatan:* Nyalakan kembali VM saat asisten praktikum akan melakukan penilaian langsung.
