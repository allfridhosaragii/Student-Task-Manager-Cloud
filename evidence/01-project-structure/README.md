# BUKTI 1: STRUKTUR PROJECT DAN KONFIGURASI

## 1. Perintah Pengambilan Bukti
Buka terminal pada direktori `Student-Task-Manager` dan jalankan:
```bash
# Tampilkan struktur pohon direktori
tree -L 3 -I "node_modules"
# atau di Windows PowerShell:
Get-ChildItem -Recurse -Depth 2 -Exclude "node_modules"

# Tampilkan isi Dockerfile
cat Dockerfile

# Tampilkan isi compose.yaml
cat compose.yaml
```

## 2. Kondisi yang Wajib Terlihat dalam Screenshot
- Struktur folder project lengkap (`src/`, `public/`, `docs/`, `tests/`, `scripts/`, `evidence/`).
- File `Dockerfile` multi-stage dan `compose.yaml`.
- Konfigurasi dua service: `app` dan `database`.
- Konfigurasi isolasi network (`backend` dengan `internal: true`).
- Konfigurasi persistent named volume `postgres_data`.
- Konfigurasi healthcheck `pg_isready` dan `depends_on: database: condition: service_healthy`.
- Konfigurasi restart policy `unless-stopped`.

## 3. Status Bukti
- **Status:** SIAP DILAMPIRKAN (Screenshot editor / terminal siap diambil).
- **Target File Screenshot:** `evidence/01-project-structure/bukti_01_struktur_dan_konfigurasi.png`
