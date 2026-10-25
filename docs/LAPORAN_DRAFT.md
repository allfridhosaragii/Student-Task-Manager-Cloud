# DRAFT LAPORAN PRAKTIKUM INDIVIDU
## KOMPUTASI AWAN — PRAKTIKUM 2
### "Virtualisasi Proyek via Docker pada Azure Virtual Machine"

---

## IDENTITAS MAHASISWA
- **Nama Mahasiswa:** [Nama Lengkap Mahasiswa]
- **NIM:** [Nomor Induk Mahasiswa]
- **Kelas:** [Kelas Praktikum Komputasi Awan]
- **Program Studi:** Teknik Informatika / Sistem Informasi
- **Mata Kuliah:** Komputasi Awan (Semester 5)
- **Tautan Repositori GitHub:** `https://github.com/<username>/Student-Task-Manager-Cloud`

---

## 1. TUJUAN PRAKTIKUM
1. Mampu merancang dan membangun aplikasi web mandiri berbasis full-stack (Node.js, Express.js, PostgreSQL).
2. Mampu membuat `Dockerfile` mandiri menggunakan teknik multi-stage build untuk menghasilkan image kontainer yang efisien dan aman.
3. Mampu mengorkestrasi multi-service kontainer (aplikasi dan database) menggunakan Docker Compose (`compose.yaml`).
4. Mampu menerapkan isolasi jaringan internal Docker (`internal: true`) dan penyimpanan data persisten (*named volume*).
5. Mampu menerapkan mekanisme *healthcheck*, dependensi antar-layanan (*depends_on*), dan kebijakan *restart* (*unless-stopped*).
6. Mampu melakukan deployment kontainer ke infrastruktur cloud Microsoft Azure Virtual Machine (Ubuntu 24.04 LTS).
7. Mampu membuktikan dan mendokumentasikan 7 bukti pengujian wajib sesuai standar evaluasi asisten praktikum.

---

## 2. DASAR TEORI

### 2.1 Virtualisasi vs Kontainerisasi
Virtualisasi level perangkat keras (Hypervisor) memvirtualisasikan seluruh mesin fisik beserta sistem operasi tamu (*guest OS*), yang memerlukan alokasi sumber daya memori dan komputasi yang besar. Sebaliknya, kontainerisasi (seperti Docker) memvirtualisasikan sistem operasi pada level kernel Linux. Setiap kontainer berbagi kernel dengan host namun terisolasi dalam *user space*, namespace, dan cgroups, menghasilkan proses startup dalam hitungan detik dan efisiensi memori yang sangat tinggi.

### 2.2 Docker & Multi-Stage Build
Docker menggunakan berkas instruksi `Dockerfile` untuk membangun *image* kontainer berlapis (*layered filesystem*). Pendekatan *multi-stage build* memisahkan tahapan instalasi dependensi (*builder stage*) dari tahapan runtime produksi (*runner stage*). Hal ini menghasilkan image akhir yang bersih tanpa menyertakan compiler, package manager cache, maupun dependensi development, sehingga memperkecil celah keamanan (*attack surface*).

### 2.3 Docker Compose & Jaringan Terisolasi
Docker Compose mengotomatisasi orkestrasi multi-kontainer melalui berkas deklaratif YAML. Melalui Docker Network driver bridge dengan atribut `internal: true`, kontainer database dapat diisolasi total sehingga hanya dapat diakses oleh kontainer aplikasi dalam jaringan yang sama, tanpa membuka port host ke internet.

### 2.4 Persistensi Data melalui Docker Named Volume
Secara default, lapisan penyimpanan kontainer bersifat *ephemeral* (data akan hilang saat kontainer dihapus). Docker Named Volume mengikat direktori database di dalam kontainer (`/var/lib/postgresql/data`) ke direktori terkelola di host Linux, menjamin integritas data tetap bertahan meskipun kontainer dimatikan atau diperbarui (*lifecycle decoupling*).

---

## 3. ALAT DAN BAHAN
1. **Perangkat Lunak Lokal:** Windows 11, Node.js v24.1.0, npm 11.3.0, Git 2.52, Visual Studio Code / Google Antigravity IDE.
2. **Perangkat Lunak Server:** Ubuntu Server 24.04 LTS, Docker Engine v26+, Docker Compose V2.
3. **Infrastruktur Cloud:** Microsoft Azure Virtual Machine (`edo-praktikum2`, Standard B-series, Region Indonesia Central, langganan Azure for Students).
4. **Keamanan Jaringan:** Azure Network Security Group (Inbound Port 22 SSH dan Port 80 HTTP).

---

## 4. DESKRIPSI DAN ARSITEKTUR PROYEK

### 4.1 Deskripsi Proyek "Student Task Manager"
Aplikasi "Student Task Manager" adalah sistem manajemen penugasan akademik yang dirancang khusus untuk mahasiswa. Aplikasi ini memungkinkan pencatatan, pemantauan status, pengaturan prioritas, pencarian instan, dan pelacakan deadline tugas kuliah.

### 4.2 Arsitektur Sistem
Aplikasi menerapkan arsitektur dua service:
- **Service `app`:** Node.js Express.js yang menyajikan RESTful API dan aset frontend modern (HTML5, CSS3, JavaScript). Service ini membuka port 3000 dan dipetakan ke port 80 pada host VM.
- **Service `database`:** PostgreSQL 16 Alpine yang menyimpan data tugas secara persisten pada named volume `student_task_postgres_data`. Service ini terhubung secara eksklusif ke internal network `student_task_backend`.

---

## 5. IMPLEMENTASI CONTAINERIZATION

### 5.1 Dockerfile Aplikasi
Dockerfile menggunakan dua stage:
1. `deps`: Mengunduh dependensi produksi via `npm ci --omit=dev`.
2. `runner`: Menggunakan base image `node:20-alpine`, beralih ke non-root user `USER node`, menyalin direktori `src/`, `public/`, dan `node_modules`, serta menjalankan `node src/server.js` pada `0.0.0.0:3000`.

### 5.2 Konfigurasi Docker Compose (`compose.yaml`)
Konfigurasi Compose mendefinisikan:
- Service `app` dan `database`.
- Network `frontend` (publik) dan `backend` (`internal: true`).
- Named volume `postgres_data`.
- Healthcheck `pg_isready` pada database dan `depends_on: database: condition: service_healthy` pada app.
- Restart policy `unless-stopped` pada kedua service.
- Penggunaan `.env` untuk menyimpan rahasia konfigurasi tanpa memasukkannya ke Git history.

---

## 6. HASIL PENGUJIAN DAN BUKTI PRAKTIKUM

### 6.1 Bukti 1: Struktur Project dan Konfigurasi
Menampilkan hierarki folder, isi `Dockerfile` multi-stage, dan konfigurasi `compose.yaml`.  
*(Lampiran Screenshot: `evidence/01-project-structure/`)*

### 6.2 Bukti 2: Status Container di Azure VM
Eksekusi perintah `docker compose ps` di Azure VM menampilkan kedua container (`student-task-app` dan `student-task-db`) berstatus `Up (healthy)`.  
*(Lampiran Screenshot: `evidence/02-container-status/`)*

### 6.3 Bukti 3: Akses Aplikasi melalui Public IP
Aplikasi dapat dibuka dengan lancar pada browser melalui `http://<IP_PUBLIC_VM>` tanpa error 500. Seluruh fungsi antarmuka, metrik ringkasan, dan kartu tugas muncul sempurna.  
*(Lampiran Screenshot: `evidence/03-public-access/`)*

### 6.4 Bukti 4: Halaman Overview Azure Portal
Halaman Overview pada Azure Portal membuktikan bahwa VM `edo-praktikum2` berstatus `Running` dengan IP publik yang sama persis dengan yang diakses pada Bukti 3.  
*(Lampiran Screenshot: `evidence/04-azure-overview/`)*

### 6.5 Bukti 5: Pengujian Persistensi Data
1. Menambahkan tugas kuliah dengan judul `UJI-PERSISTENSI-DOCKER`.
2. Menghentikan dan menghapus container dengan `docker compose down`.
3. Menjalankan ulang container dengan `docker compose up -d`.
4. Membuka kembali aplikasi di browser; tugas `UJI-PERSISTENSI-DOCKER` tetap tersimpan utuh di dalam database PostgreSQL.  
*(Lampiran Screenshot: `evidence/05-data-persistence/`)*

### 6.6 Bukti 6: Keamanan Network Database
Pemeriksaan `docker compose ps database` membuktikan tidak ada port host yang terbuka. Perintah `docker network inspect student_task_backend` membuktikan atribut `"Internal": true`. Percobaan koneksi langsung ke port 5432 dari luar ditolak.  
*(Lampiran Screenshot: `evidence/06-network-security/`)*

### 6.7 Bukti 7: Verifikasi Restart Policy
Pemeriksaan `docker inspect` membuktikan kedua container memiliki konfigurasi `RestartPolicy: {"Name":"unless-stopped"}`. Saat service Docker daemon di-restart pada server, kedua container otomatis aktif kembali.  
*(Lampiran Screenshot: `evidence/07-restart-test/`)*

---

## 7. ANALISIS DAN PEMBAHASAN
1. **Efisiensi Kontainerisasi:** Penggunaan Alpine Linux memangkas ukuran image hingga ~150MB, mempercepat waktu transfer dan deployment di cloud VM.
2. **Keandalan Startup:** Penerapan `healthcheck` dan `condition: service_healthy` berhasil mencegah race condition di mana server aplikasi mencoba terhubung sebelum PostgreSQL siap menerima koneksi socket.
3. **Keamanan Bertingkat:** Kombinasi isolasi network internal, ketiadaan published host port pada database, eksekusi non-root user, parameterized query SQL, dan enkripsi SSH ed25519 memberikan perlindungan menyeluruh terhadap ancaman peretasan umum.

---

## 8. KESIMPULAN
1. Praktikum individu containerize project pribadi "Student Task Manager" telah berhasil diselesaikan dengan memenuhi seluruh 8 ketentuan wajib dan 7 bukti pengujian yang disyaratkan.
2. Proyek berhasil diorkestrasi menggunakan Docker Compose dengan pemisahan network publik dan internal serta volume penyimpanan persisten.
3. Aplikasi berhasil berjalan di Azure Virtual Machine Ubuntu 24.04 LTS dan dapat diakses dengan stabil melalui alamat IP publik port 80.
