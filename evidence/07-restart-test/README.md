# BUKTI 7: VERIFIKASI KEBIJAKAN RESTART CONTAINER

## 1. Perintah Pengambilan Bukti
Jalankan di terminal SSH Azure VM:
```bash
cd ~/Student-Task-Manager

# 1. Inspeksi RestartPolicy kedua kontainer
docker inspect student-task-app --format='App RestartPolicy: {{json .HostConfig.RestartPolicy}}'
docker inspect student-task-db --format='DB RestartPolicy: {{json .HostConfig.RestartPolicy}}'

# 2. Uji ketahanan dengan me-restart service Docker Daemon
sudo systemctl restart docker

# Tunggu 5 detik
sleep 5

# 3. Periksa status kontainer setelah daemon restart
docker compose ps
```

## 2. Kondisi yang Wajib Terlihat dalam Screenshot
- Nilai `RestartPolicy` kedua kontainer menunjukkan `{"Name":"unless-stopped"}`.
- Setelah service Docker di-restart pada server Linux, kedua kontainer secara otomatis kembali hidup (*Up*) tanpa perlu perintah manual `docker compose up`.

## 3. Status Bukti
- **Status:** MENUNGGU EKSEKUSI DI AZURE VM (Dijalankan saat VM dinyalakan oleh pengguna).
- **Target File Screenshot:** `evidence/07-restart-test/bukti_07_restart_policy_test.png`
