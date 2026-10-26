# BUKTI 2: STATUS CONTAINER DI AZURE VM (DOCKER COMPOSE PS)

## 1. Deskripsi Bukti
Bukti ini mendokumentasikan status operasional kedua kontainer utama (`student-task-app` dan `student-task-db`) pada Azure Virtual Machine `edo-praktikum2` setelah orkestrasi `docker compose up -d` dijalankan.

## 2. Berkas Bukti yang Tersedia di Folder Ini
- **`docker_compose_ps.txt`**: Salinan keluaran terminal aktual perintah `docker compose ps` yang dieksekusi di server Azure VM:
  ```text
  NAME               IMAGE                      COMMAND                  SERVICE    CREATED          STATUS                    PORTS
  student-task-app   student-task-manager-app   "docker-entrypoint.s…"   app        11 minutes ago   Up 11 minutes (healthy)   0.0.0.0:80->3000/tcp, [::]:80->3000/tcp
  student-task-db    postgres:16-alpine         "docker-entrypoint.s…"   database   11 minutes ago   Up 11 minutes (healthy)   5432/tcp
  ```

## 3. Kondisi yang Tervalidasi
- Kontainer aplikasi `student-task-app` berstatus `Up (healthy)` dengan port mapping `0.0.0.0:80->3000/tcp`.
- Kontainer basis data `student-task-db` berstatus `Up (healthy)` dengan port `5432/tcp` terisolasi internal tanpa dipublish ke host.
- Seluruh pemeriksaan kesehatan (*healthcheck*) internal kontainer lulus tanpa kesalahan.

## 4. Status Bukti
- **Status:** TERVERIFIKASI RUNTIME (Log terminal aktual tersedia).
- *Catatan:* Tangkapan layar grafis jendela terminal SSH dapat diambil tambahan saat sesi demonstrasi langsung kepada asisten praktikum dengan menyalakan VM kembali.
