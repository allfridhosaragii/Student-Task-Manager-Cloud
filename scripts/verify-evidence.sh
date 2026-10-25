#!/usr/bin/env bash
# ==============================================================================
# STUDENT TASK MANAGER - VERIFIKASI 7 BUKTI PENGUJIAN PRAKTIKUM
# ==============================================================================

PROJECT_DIR="$HOME/Student-Task-Manager"
cd "$PROJECT_DIR" || exit 1

echo "=========================================================="
echo "          VERIFIKASI 7 BUKTI WAJIB PRAKTIKUM DOCKER       "
echo "=========================================================="

echo ""
echo ">>> [BUKTI 1] STRUKTUR PROJECT & KONFIGURASI"
echo "--- Dockerfile ---"
head -n 25 Dockerfile
echo ""
echo "--- compose.yaml (Ringkasan Service & Networks) ---"
grep -E "services:|app:|database:|image:|ports:|networks:|restart:|depends_on:|volumes:|internal:" compose.yaml

echo ""
echo ">>> [BUKTI 2] STATUS CONTAINER DI AZURE VM"
docker compose ps

echo ""
echo ">>> [BUKTI 3] KONEKSI APLIKASI MELALUI HTTP PORT 80"
PUBLIC_IP=$(curl -s -4 ifconfig.me || echo "127.0.0.1")
echo "Public IP: $PUBLIC_IP"
curl -I -s "http://127.0.0.1:80" | head -n 5
curl -s "http://127.0.0.1:80/health" | head -n 1
echo ""

echo ""
echo ">>> [BUKTI 4] CATATAN HALAMAN OVERVIEW AZURE"
echo "Pastikan screenshot Azure Portal memuat:"
echo "- Nama VM: edo-praktikum2"
echo "- Status: Running"
echo "- Public IP Address: $PUBLIC_IP"

echo ""
echo ">>> [BUKTI 5] UJI PERSISTENSI DATA"
echo "1. Menambahkan tugas uji persistensi via API internal..."
curl -s -X POST "http://127.0.0.1:80/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"UJI-PERSISTENSI-DOCKER","course":"Komputasi Awan","deadline":"2026-10-31","priority":"high","status":"in_progress"}' | head -n 1
echo ""
echo "2. Mematikan container dengan docker compose down (tanpa flag -v)..."
docker compose down
echo "3. Menyalakan container kembali..."
docker compose up -d
echo "4. Menunggu database healthy (5 detik)..."
sleep 5
echo "5. Memeriksa keberadaan data tugas yang disimpan sebelumnya:"
curl -s "http://127.0.0.1:80/api/tasks?search=UJI-PERSISTENSI-DOCKER" | head -n 1
echo ""

echo ""
echo ">>> [BUKTI 6] KEAMANAN NETWORK DATABASE (INTERNAL NETWORK ISOLATION)"
echo "1. Memeriksa published port pada container:"
docker compose ps database
echo "2. Memeriksa konfigurasi internal network:"
docker network inspect student_task_backend | grep -E "Internal|Name"
echo "3. Mencoba koneksi lokal dari host ke port 5432 (harus ditolak/connection refused):"
nc -z -v -w 2 127.0.0.1 5432 2>&1 || echo "Koneksi ke port 5432 ditolak (Aman: Database tidak dipublikasikan ke host)"

echo ""
echo ">>> [BUKTI 7] VERIFIKASI RESTART POLICY"
echo "RestartPolicy Service App:"
docker inspect student-task-app --format='{{json .HostConfig.RestartPolicy}}'
echo "RestartPolicy Service Database:"
docker inspect student-task-db --format='{{json .HostConfig.RestartPolicy}}'

echo ""
echo "=========================================================="
echo "          SELURUH PEMERIKSAAN BUKTI SELESAI               "
echo "=========================================================="
