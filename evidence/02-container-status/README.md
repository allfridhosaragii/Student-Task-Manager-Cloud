# BUKTI 2: STATUS CONTAINER DI AZURE VM

## 1. Perintah Pengambilan Bukti
Jalankan di terminal SSH Azure VM (`edo-praktikum2`):
```bash
cd ~/Student-Task-Manager
docker compose ps
```

## 2. Kondisi yang Wajib Terlihat dalam Screenshot
- Terminal SSH menunjukkan prompt server `azureuser@edo-praktikum2:~/Student-Task-Manager$`.
- Container `student-task-app` dengan status `Up` (healthy) dan port `0.0.0.0:80->3000/tcp`.
- Container `student-task-db` dengan status `Up` (healthy) dan port `5432/tcp` internal.
- Tidak ada container yang berstatus `exited` atau `restarting`.

## 3. Status Bukti
- **Status:** MENUNGGU EKSEKUSI DI AZURE VM (Dijalankan saat VM dinyalakan oleh pengguna).
- **Target File Screenshot:** `evidence/02-container-status/bukti_02_status_container_vm.png`
