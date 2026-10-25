#!/usr/bin/env bash
# ==============================================================================
# STUDENT TASK MANAGER - VERIFIKASI 7 BUKTI WAJIB PRAKTIKUM DOCKER & AZURE VM
# Penggunaan: ./scripts/verify-evidence.sh [IP_PUBLIC_VM]
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

PUBLIC_IP="${1:-127.0.0.1}"

echo "=========================================================="
echo "    VERIFIKASI 7 BUKTI WAJIB & INTEGRASI DATABASE NYATA   "
echo "=========================================================="
echo "Target IP: $PUBLIC_IP"
echo ""

echo ">>> [BUKTI 1] STRUKTUR PROJECT & KONFIGURASI"
echo "--- Dockerfile ---"
head -n 30 Dockerfile
echo ""
echo "--- compose.yaml (Layanan, Jaringan, dan Volume) ---"
grep -E "services:|app:|database:|test-runner:|image:|ports:|networks:|restart:|depends_on:|volumes:|internal:" compose.yaml
echo ""

echo ">>> [BUKTI 2] STATUS CONTAINER DI AZURE VM"
docker compose ps
echo ""

echo ">>> [BUKTI 3] KONEKSI APLIKASI MELALUI HTTP PORT 80"
echo "Menguji respons HTTP pada port 80..."
curl -I -s "http://127.0.0.1:80" | head -n 5 || echo "[WARN] Gagal menghubungi port 80 lokal"
echo ""
echo "Memeriksa status healthcheck aplikasi:"
curl -s "http://127.0.0.1:80/health" | head -n 1
echo ""

echo ">>> [BUKTI 4] CATATAN HALAMAN OVERVIEW AZURE"
echo "Pastikan screenshot Azure Portal memuat:"
echo "- Nama Virtual Machine: edo-praktikum2"
echo "- Status: Running"
echo "- Public IP Address: $PUBLIC_IP"
echo ""

echo ">>> [PENGUJIAN INTEGRASI DATABASE SUNGGUHAN (ZERO MOCK)]"
echo "Menjalankan test suite integrasi di dalam jaringan internal backend..."
# Menjalankan kontainer test-runner terisolasi pada student_task_backend network
docker compose --profile test run --rm test-runner
echo ""

echo ">>> [BUKTI 5] UJI PERSISTENSI DATA"
echo "1. Menambahkan tugas uji persistensi via HTTP API port 80..."
PERSIST_TASK_TITLE="UJI-PERSISTENSI-DOCKER-$(date +%s)"
curl -s -X POST "http://127.0.0.1:80/api/tasks" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"$PERSIST_TASK_TITLE\",\"course\":\"Komputasi Awan\",\"deadline\":\"2026-10-31\",\"priority\":\"high\",\"status\":\"in_progress\"}" | head -n 1
echo ""
echo "2. Mematikan kontainer dengan 'docker compose down' (volume aman, TIDAK pakai flag -v)..."
docker compose down
echo "3. Menyalakan kontainer kembali dengan 'docker compose up -d'..."
docker compose up -d
echo "4. Menunggu database healthy (5 detik)..."
sleep 5
echo "5. Memeriksa keberadaan data tugas yang disimpan sebelumnya:"
curl -s "http://127.0.0.1:80/api/tasks?search=UJI-PERSISTENSI-DOCKER" | head -n 1
echo ""

echo ">>> [BUKTI 6] KEAMANAN NETWORK DATABASE (INTERNAL NETWORK ISOLATION)"
echo "1. Memeriksa published port pada container database:"
docker compose ps database
echo "2. Memeriksa atribut internal pada network backend:"
docker network inspect student_task_backend | grep -E "Internal|Name"
echo "3. Mencoba koneksi dari host ke database port 5432 (harus ditolak/connection refused):"
if command -v nc &> /dev/null; then
    nc -z -v -w 2 127.0.0.1 5432 2>&1 || echo "[AMAN] Koneksi ke port 5432 ditolak (Database tidak dipublikasikan ke host)"
else
    echo "[INFO] nc (netcat) tidak tersedia; verifikasi port melalui docker compose ps membuktikan 5432 tidak dipetakan ke host."
fi
echo ""

echo ">>> [BUKTI 7] VERIFIKASI KEBIJAKAN RESTART CONTAINER"
echo "RestartPolicy Service App:"
docker inspect student-task-app --format='{{json .HostConfig.RestartPolicy}}'
echo "RestartPolicy Service Database:"
docker inspect student-task-db --format='{{json .HostConfig.RestartPolicy}}'
echo ""

echo "=========================================================="
echo "          SELURUH PEMERIKSAAN BUKTI SELESAI               "
echo "=========================================================="
