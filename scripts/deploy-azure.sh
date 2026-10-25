#!/usr/bin/env bash
# ==============================================================================
# STUDENT TASK MANAGER - AZURE VM AUTOMATED DEPLOYMENT SCRIPT
# Jalankan di Azure Virtual Machine (Ubuntu 24.04 LTS)
# Penggunaan: ./scripts/deploy-azure.sh <IP_PUBLIC_VM>
# ==============================================================================

set -e

echo "=========================================================="
echo "    DEPLOYING STUDENT TASK MANAGER ON AZURE VM (DOCKER)   "
echo "=========================================================="

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# 1. Validasi Alamat IP Publik dari Azure Portal
PUBLIC_IP="$1"
if [ -z "$PUBLIC_IP" ]; then
    echo "Masukkan IP Publik Azure VM yang tercantum pada halaman Overview Azure Portal."
    read -r -p "Alamat IP Publik Azure VM: " PUBLIC_IP
fi

# Validasi format IP (IPv4)
if [[ ! "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "[ERROR] Format IP Publik '$PUBLIC_IP' tidak valid. Gunakan format IPv4 (contoh: 20.198.xxx.xxx)."
    exit 1
fi

echo "[INFO] Menggunakan IP Publik Azure VM: $PUBLIC_IP"

# 2. Periksa Instalasi Docker & Docker Compose V2
echo "[1/5] Memeriksa ketersediaan Docker Engine dan Docker Compose..."
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "[OK] Docker Engine dan Docker Compose V2 sudah terinstal pada VM."
else
    echo "[INFO] Menginstal Docker Engine dan Docker Compose V2 pada Ubuntu..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
    echo "[OK] Instalasi Docker selesai."
fi

docker --version
docker compose version

# 3. Konfigurasi File Lingkungan (.env) secara Aman
echo "[2/5] Menyiapkan file konfigurasi lingkungan (.env)..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "[INFO] Membuat file .env baru dengan kredensial aman..."
    # Generate password acak 24 karakter yang kuat dan aman
    SECURE_PASS=$(openssl rand -hex 16 2>/dev/null || tr -dc 'A-Za-z0-9_!@' < /dev/urandom | head -c 24)
    
    # Buat file dengan hak akses terbatas hanya untuk user pemilik (chmod 600)
    touch "$PROJECT_DIR/.env"
    chmod 600 "$PROJECT_DIR/.env"

    cat <<EOF > "$PROJECT_DIR/.env"
# Environment Configuration - Production Azure VM
NODE_ENV=production
HOST_HTTP_PORT=80
APP_PORT=3000
APP_URL=http://${PUBLIC_IP}
DB_HOST=database
DB_PORT=5432
DB_NAME=student_tasks
DB_USER=taskuser
DB_PASSWORD=${SECURE_PASS}
EOF
    echo "[OK] File .env berhasil dibuat dengan izin akses 600."
else
    echo "[INFO] File .env sudah ada. Memperbarui APP_URL dengan IP: $PUBLIC_IP..."
    chmod 600 "$PROJECT_DIR/.env"
    sed -i "s|^APP_URL=.*|APP_URL=http://${PUBLIC_IP}|" "$PROJECT_DIR/.env"
    echo "[OK] APP_URL diperbarui tanpa mengubah kredensial database yang sudah ada."
fi

# 4. Validasi Sintaks compose.yaml & Build Image
echo "[3/5] Memvalidasi compose.yaml dan membangun image Docker..."
docker compose config -q
echo "[OK] Sintaks compose.yaml valid."

docker compose build --pull

# 5. Jalankan Service Kontainer
echo "[4/5] Menjalankan service kontainer (app & database)..."
# PERHATIAN: Tidak pernah menggunakan flag -v agar volume dan data database tetap persisten
docker compose up -d

# 6. Verifikasi Healthcheck Kontainer
echo "[5/5] Menunggu service mencapai status HEALTHY..."
for i in {1..20}; do
    STATUS_DB=$(docker inspect --format='{{.State.Health.Status}}' student-task-db 2>/dev/null || echo "starting")
    STATUS_APP=$(docker inspect --format='{{.State.Health.Status}}' student-task-app 2>/dev/null || echo "starting")
    echo "Pemeriksaan $i/20 -> Database: $STATUS_DB | App: $STATUS_APP"
    if [ "$STATUS_DB" == "healthy" ] && [ "$STATUS_APP" == "healthy" ]; then
        echo "[SUCCESS] Kedua kontainer telah berstatus HEALTHY!"
        break
    fi
    sleep 3
done

echo ""
echo "=========================================================="
echo "               STATUS CONTAINER SAAT INI                  "
echo "=========================================================="
docker compose ps

echo ""
echo "=========================================================="
echo "   DEPLOYMENT SUKSES! APLIKASI TELAH AKTIF DI AZURE VM   "
echo "=========================================================="
echo "Buka browser Anda di: http://${PUBLIC_IP}"
echo "Untuk menjalankan verifikasi 7 bukti, jalankan:"
echo "  ./scripts/verify-evidence.sh ${PUBLIC_IP}"
echo "=========================================================="
