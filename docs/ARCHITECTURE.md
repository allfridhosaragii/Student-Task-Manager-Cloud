# Arsitektur Sistem — Student Task Manager

Dokumen ini mendeskripsikan rancangan arsitektur perangkat lunak, infrastruktur kontainerisasi Docker, serta tata kelola jaringan dan data pada proyek **Student Task Manager** untuk mata kuliah Komputasi Awan.

---

## 1. Diagram Arsitektur Keseluruhan

```mermaid
graph TD
    User["🌐 Browser Pengguna / Asisten Praktikum"] -->|HTTP Port 80| Host["💻 Azure Virtual Machine (Ubuntu 24.04 LTS)"]
    
    subgraph HostVM ["Azure VM Infrastructure"]
        Host -->|Port Forwarding 80:3000| AppContainer["📦 Container: student-task-app<br/>(Node.js 20 Alpine + Express.js)<br/>Port: 3000"]
        
        subgraph DockerBridge ["Docker Networks"]
            subgraph FrontendNet ["student_task_frontend (bridge)"]
                AppContainer
            end
            
            subgraph BackendNet ["student_task_backend (bridge, internal: true)"]
                AppContainer -->|Koneksi DB (DB_HOST=database:5432)| DBContainer["📦 Container: student-task-db<br/>(PostgreSQL 16 Alpine)<br/>NO HOST PORT MAPPING"]
            end
        end
        
        subgraph StoragePersistence ["Docker Volumes"]
            DBContainer -->|Persistensi Data ke /var/lib/postgresql/data| Vol[("💾 Named Volume: student_task_postgres_data")]
        end
    end

    classDef container fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef network fill:#0f172a,stroke:#3b82f6,stroke-width:1px,stroke-dasharray: 5 5,color:#94a3b8;
    classDef storage fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    class AppContainer,DBContainer container;
    class FrontendNet,BackendNet network;
    class Vol storage;
```

---

## 2. Rincian Komponen Sistem

### A. Frontend Layer (Static Assets via Express)
- **Teknologi:** Semantic HTML5, Vanilla CSS3 (Custom Variables, Responsive Grid/Flexbox), Vanilla Modern JavaScript (ES6+ Modular).
- **Aset:** `public/index.html`, `public/css/style.css`, `public/js/app.js`.
- **Fungsi:** 
  - Menyajikan dashboard statistik tugas (Total, Pending, In Progress, Completed).
  - Kontrol pencarian (search debounce) dan multi-filter (status, prioritas, sorting).
  - Formulir modal pembuatan dan pembaruan tugas dengan validasi di sisi client.
  - Dialog modal konfirmasi penghapusan tugas.
  - Quick status dropdown langsung dari kartu tugas.
  - Toast notification untuk umpan balik instan kepada pengguna.
  - Indikator detak jantung sistem (*live health status pill*).

### B. Backend Application Layer (`app`)
- **Teknologi:** Node.js v20 (Alpine), Express.js.
- **Port:** Bind ke `0.0.0.0:3000` di dalam kontainer, dipetakan ke host port `80`.
- **Modul Utama:**
  - `src/server.js`: Inisialisasi HTTP server, eksekusi migrasi otomatis saat start, penanganan *graceful shutdown* (`SIGTERM`, `SIGINT`).
  - `src/app.js`: Konfigurasi Express, middleware (CORS, JSON parser), rute API, error handling terpusat.
  - `src/controllers/taskController.js`: Validasi input data, status HTTP yang sesuai, format respons JSON terstandarisasi.
  - `src/services/taskService.js`: Business logic dan eksekusi kueri SQL terparameterisasi (*parameterized queries*).
  - `src/database/db.js`: PostgreSQL connection pool menggunakan `pg.Pool` dengan manajemen *idle client* dan uji koneksi berkala.
  - `src/database/migrate.js`: Migrasi skema database yang *idempotent* dan *initial seed* data tugas jika tabel kosong.

### C. Database Layer (`database`)
- **Teknologi:** PostgreSQL 16 Alpine resmi.
- **Port:** Port `5432` hanya dapat diakses melalui jaringan internal Docker `student_task_backend`. **Tidak ada port host yang dibuka.**
- **Skema Database:**
  ```sql
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course VARCHAR(150) NOT NULL,
    deadline DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
  ```

---

## 3. Isolasi Keamanan Jaringan (Network Security)

Sesuai **Ketentuan 3** dari modul tugas praktikum:
1. Dua jaringan Docker terpisah didefinisikan pada `compose.yaml`:
   - `frontend`: Menghubungkan service `app` dengan jaringan publik host agar dapat melayani request HTTP port 80.
   - `backend`: Jaringan internal Docker dengan flag `internal: true`.
2. Service `database` **hanya** terhubung ke jaringan `backend`. Jaringan ini:
   - Tidak dapat diakses langsung oleh host VM maupun internet.
   - Tidak memiliki rute gateway eksternal.
   - Database hanya merespons koneksi dari container yang berbagi jaringan `backend` (yaitu `app`).
3. Browser klien dan pihak luar tidak pernah dapat melakukan query langsung ke PostgreSQL, mencegah serangan langsung pada port database.

---

## 4. Persistensi Data (Persistent Volume)

Sesuai **Ketentuan 4** dari modul tugas praktikum:
- Menggunakan named volume Docker: `student_task_postgres_data`.
- Dipetakan ke direktori data standar PostgreSQL: `/var/lib/postgresql/data`.
- Mekanisme ini memastikan bahwa:
  - Siklus hidup data independen dari siklus hidup kontainer.
  - Menjalankan `docker compose down` hanya menghapus kontainer dan jaringan virtual sementara, tanpa menghapus named volume.
  - Saat `docker compose up -d` dijalankan kembali, data tugas kuliah yang telah diinputkan tetap utuh dan tersedia.
