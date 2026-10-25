# Kebijakan Keamanan Sistem (Security Policy & Best Practices)

Dokumen ini menguraikan seluruh lapisan pertahanan dan praktik keamanan (*security-in-depth*) yang diterapkan pada proyek **Student Task Manager**, baik di level aplikasi, kontainer Docker, maupun infrastruktur Azure Virtual Machine.

---

## 1. Perlindungan Kredensial & Lingkungan (.env Protection)

- **Pemisahan Konfigurasi dan Kode:** Seluruh kredensial sensitif seperti nama database, user, password, dan port dibaca melalui environment variables menggunakan pustaka `dotenv`.
- **Eksklusi Git:** File `.env` secara tegas didaftarkan pada `.gitignore`. Kredensial tidak pernah masuk ke dalam staging Git maupun riwayat commit GitHub.
- **Eksklusi Image Docker:** File `.env` didaftarkan pada `.dockerignore` untuk memastikan file rahasia lokal tidak pernah tersalin ke dalam layer image kontainer.
- **Penyediaan Template Aman:** Disediakan file `.env.example` yang hanya berisi nama variabel dan nilai contoh non-sensitif sebagai panduan konfigurasi.

---

## 2. Isolasi Jaringan Database (Internal Network Isolation)

- **Tidak Ada Port Host yang Dipublikasikan:** File `compose.yaml` secara sengaja **tidak** menyertakan direktif `ports` pada service `database`.
- **Docker Internal Bridge Network:** Service `database` hanya terhubung ke jaringan `student_task_backend` yang memiliki konfigurasi:
  ```yaml
  backend:
    driver: bridge
    name: student_task_backend
    internal: true
  ```
  Direktif `internal: true` melarang paket jaringan keluar ke internet maupun menerima koneksi masuk langsung dari gateway host. Satu-satunya entitas yang dapat berkomunikasi dengan PostgreSQL adalah kontainer `app` yang berada pada jaringan yang sama.

---

## 3. Penguatan Keamanan Kontainer (Container Hardening)

- **Non-Root Execution (`USER node`):** Pada `Dockerfile`, stage akhir (*runner*) beralih ke user `node` berhak akses terbatas (*least privilege*). Jika terjadi kerentanan pada aplikasi Express, penyerang tidak memiliki hak akses `root` di dalam kontainer maupun kemampuan *container breakout* ke host Linux.
- **Minimal Base Image:** Penggunaan `node:20-alpine` dan `postgres:16-alpine` memangkas ratusan utilitas sistem yang tidak diperlukan, memperkecil secara signifikan *attack surface* (*CVE footprint*).
- **Multi-Stage Build Sanitization:** Alat kompilasi dan dependensi pengembangan dibuang pada stage builder sehingga image produksi hanya membawa file esensial.

---

## 4. Keamanan Aplikasi & Validasi Data

- **Pencegahan SQL Injection:** Seluruh kueri SQL di `src/services/taskService.js` menggunakan *parameterized queries* bawaan PostgreSQL driver (`$1, $2, ...`). Nilai input tidak pernah digabungkan secara langsung (*string concatenation*) ke dalam string SQL.
- **Validasi Input Berlapis:** 
  - Sisi Client: Validasi tipe data, batas karakter, dan format tanggal sebelum request dikirim.
  - Sisi Server: Validasi ketat pada `taskController.js` terhadap panjang judul (min 3 karakter), mata kuliah (min 2 karakter), format tanggal ISO YYYY-MM-DD, dan *whitelisting* status/prioritas.
- **Pencegahan Cross-Site Scripting (XSS):** Data dinamis yang dirender ke antarmuka pengguna disaring melalui fungsi `escapeHtml()` untuk mencegah eksekusi skrip berbahaya di browser pengguna.

---

## 5. Keamanan Infrastruktur Azure

- **Kunci Asimetris Modern (SSH ED25519):** Akses remote ke Azure VM menggunakan algoritma kriptografi kurva eliptik `ed25519`, yang jauh lebih aman dan efisien dibandingkan password teks atau kunci RSA lama.
- **Azure Network Security Group (NSG) Rules:**
  - Inbound Allow: Port 22 (SSH) dan Port 80 (HTTP).
  - Port 5432 (PostgreSQL) diblokir sepenuhnya oleh default deny rule Azure.
