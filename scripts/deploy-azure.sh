#!/usr/bin/env bash
# ==============================================================================
# STUDENT TASK MANAGER - AZURE VM AUTOMATED DEPLOYMENT SCRIPT
# Jalankan di Azure Virtual Machine (Ubuntu 24.04 LTS)
# ==============================================================================

set -e

echo "=========================================================="
echo "    DEPLOYING STUDENT TASK MANAGER ON AZURE VM (DOCKER)   "
echo "=========================================================="

PROJECT_DIR="$HOME/Student-Task-Manager"

# 1. Pastikan Docker dan Docker Compose V2 tersedia
echo "[1/6] Memeriksa instalasi Docker dan Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "Docker belum terinstal. Menginstal Docker Engine..."
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
    echo "Docker berhasil diinstal."
fi

docker --version
docker compose version

# 2. Periksa keberadaan file konfigurasi .env
echo "[2/6] Memeriksa file lingkungan (.env)..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        echo "Membuat .env dari .env.example..."
        cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
        # Dapatkan IP Publik Azure VM secara otomatis
        PUBLIC_IP=$(curl -s -4 ifconfig.me || curl -s api.ipify.org || echo "localhost")
        sed -i "s|http://<IP_PUBLIC_VM>|http://${PUBLIC_IP}|g" "$PROJECT_DIR/.env"
        echo "Konfigurasi .env telah disiapkan dengan APP_URL=http://${PUBLIC_IP}"
    else
        echo "Error: .env atau .env.example tidak ditemukan di $PROJECT_DIR"
        exit 1
    fi
fi

cd "$PROJECT_DIR"

# 3. Validasi konfigurasi Docker Compose
echo "[3/6] Memvalidasi compose.yaml..."
docker compose config -q
echo "Konfigurasi compose.yaml valid."

# 4. Build Docker image
echo "[4/6] Membangun image Docker aplikasi..."
docker compose build --pull

# 5. Menjalankan service dengan Docker Compose
echo "[5/6] Menjalankan service kontainer (app & database)..."
docker compose up -d

# 6. Menunggu database dan aplikasi healthy
echo "[6/6] Menunggu kontainer mencapai status Healthy..."
for i in {1..20}; do
    STATUS_DB=$(docker inspect --format='{{.State.Health.Status}}' student-task-db 2>/dev/null || echo "starting")
    STATUS_APP=$(docker inspect --format='{{.State.Health.Status}}' student-task-app 2>/dev/null || echo "starting")
    echo "Status pemeriksaan $i/20 -> Database: $STATUS_DB | App: $STATUS_APP"
    if [ "$STATUS_DB" == "healthy" ]; then
        echo "Database PostgreSQL telah mencapai kondisi HEALTHY!"
        break
    fi
    sleep 3
done

echo "=========================================================="
echo "               STATUS CONTAINER SAAT INI                  "
echo "=========================================================="
docker compose ps

PUBLIC_IP=$(curl -s -4 ifconfig.me || echo "<IP_PUBLIC_VM>")
echo ""
echo "Aplikasi berhasil berjalan!"
echo "Buka browser Anda di: http://${PUBLIC_IP}"
echo "=========================================================="
