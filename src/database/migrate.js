const { query, checkConnection } = require('./db');

const SCHEMA_SQL = `
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
`;

const INITIAL_SEEDS = [
  {
    title: 'Tugas Praktikum 2 Komputasi Awan (Containerization Docker)',
    description: 'Implementasi Dockerfile, Docker Compose multi-service, internal network, persistent volume, dan deployment ke Azure VM.',
    course: 'Komputasi Awan',
    deadline: '2026-10-28',
    priority: 'high',
    status: 'in_progress'
  },
  {
    title: 'Analisis Arsitektur Microservices & Kubernetes',
    description: 'Review jurnal dan pembuatan ringkasan arsitektur container orchestration untuk tugas kuliah.',
    course: 'Komputasi Awan',
    deadline: '2026-11-05',
    priority: 'medium',
    status: 'pending'
  },
  {
    title: 'Setup Environment Virtual Machine Azure Ubuntu',
    description: 'Konfigurasi SSH key ed25519 dan instalasi Docker Engine pada Azure Virtual Machine.',
    course: 'Sistem Operasi',
    deadline: '2026-10-20',
    priority: 'high',
    status: 'completed'
  }
];

async function migrate() {
  console.log('[Migration] Checking database readiness...');
  const connected = await checkConnection(10, 2000);
  if (!connected) {
    throw new Error('Could not establish connection to PostgreSQL database for migration.');
  }

  console.log('[Migration] Creating tables and indexes if not exists...');
  await query(SCHEMA_SQL);
  console.log('[Migration] Schema verified successfully.');

  // Check if initial seeding is needed (only if 0 rows exist)
  const countRes = await query('SELECT COUNT(*) AS total FROM tasks');
  const count = parseInt(countRes.rows[0].total, 10);

  if (count === 0) {
    console.log('[Migration] Table tasks is empty. Seeding initial academic tasks...');
    for (const seed of INITIAL_SEEDS) {
      await query(
        `INSERT INTO tasks (title, description, course, deadline, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [seed.title, seed.description, seed.course, seed.deadline, seed.priority, seed.status]
      );
    }
    console.log(`[Migration] Seeded ${INITIAL_SEEDS.length} sample tasks successfully.`);
  } else {
    console.log(`[Migration] Table tasks already contains ${count} records. Keeping persistent data intact.`);
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('[Migration] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration] Failed:', err);
      process.exit(1);
    });
}

module.exports = { migrate };
