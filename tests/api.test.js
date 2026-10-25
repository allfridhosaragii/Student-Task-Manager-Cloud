const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const db = require('../src/database/db');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

// Helper for HTTP requests
async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

test('1. GET /health - Harap merespons status endpoint kesehatan', async () => {
  const res = await request('/health');
  assert.ok(res.status === 200 || res.status === 503, 'Status code harus 200 (healthy) atau 503 (database offline)');
  assert.equal(res.data.service, 'student-task-manager');
  assert.ok(res.data.database !== undefined, 'Harus memuat informasi status database');
});

test('2. POST /api/tasks - Menolak data tanpa judul atau judul terlalu pendek', async () => {
  const res = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: 'ab',
      course: 'Komputasi Awan',
      deadline: '2026-11-01'
    })
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.match(res.data.error, /Validasi/);
});

test('3. POST /api/tasks - Menolak format tanggal deadline yang tidak valid', async () => {
  const res = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Tugas Praktikum Docker',
      course: 'Komputasi Awan',
      deadline: '32-13-2026' // Format salah
    })
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.ok(res.data.details.some(d => d.includes('deadline')));
});

test('4. POST /api/tasks - Menolak nilai prioritas yang tidak dikenali', async () => {
  const res = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Tugas Praktikum Docker',
      course: 'Komputasi Awan',
      deadline: '2026-11-01',
      priority: 'super_urgent' // Tidak ada dalam enum
    })
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.ok(res.data.details.some(d => d.includes('Prioritas')));
});

test('5. GET /api/tasks/:id - Menolak ID non-numerik', async () => {
  const res = await request('/api/tasks/abc');
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.match(res.data.error, /ID tugas tidak valid/);
});

test('6. PATCH /api/tasks/:id/status - Menolak status yang tidak valid', async () => {
  const res = await request('/api/tasks/1/status', {
    method: 'PATCH',
    body: JSON.stringify({ status: 'unknown_status' })
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.match(res.data.error, /Status tidak valid/);
});

test('7. GET /nonexistent-route - Mengembalikan 404 Not Found dengan struktur JSON', async () => {
  const res = await request('/api/nonexistent-endpoint');
  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
  assert.match(res.data.error, /tidak ditemukan/);
});

test('8. CRUD Flow dengan Simulated Database Query', async (t) => {
  // Simpan query asli
  const originalQuery = db.query;

  // Mock database in-memory table
  const mockTable = [
    {
      id: 1,
      title: 'UJI-PERSISTENSI-DOCKER',
      description: 'Pengujian persistensi data kontainer',
      course: 'Komputasi Awan',
      deadline: '2026-10-30',
      priority: 'high',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  db.query = async (sql, params) => {
    // SELECT all
    if (sql.includes('SELECT id, title, description, course') && sql.includes('FROM tasks')) {
      if (params && params.length > 0 && sql.includes('WHERE id = $1')) {
        const found = mockTable.find(item => item.id === params[0]);
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
      }
      return { rows: mockTable, rowCount: mockTable.length };
    }
    // SUMMARY
    if (sql.includes('COUNT(*)::int AS total_tasks')) {
      return {
        rows: [{
          total_tasks: mockTable.length,
          pending_tasks: mockTable.filter(t => t.status === 'pending').length,
          in_progress_tasks: mockTable.filter(t => t.status === 'in_progress').length,
          completed_tasks: mockTable.filter(t => t.status === 'completed').length,
          high_priority_tasks: mockTable.filter(t => t.priority === 'high').length,
          overdue_tasks: 0
        }],
        rowCount: 1
      };
    }
    // INSERT
    if (sql.includes('INSERT INTO tasks')) {
      const newItem = {
        id: mockTable.length + 1,
        title: params[0],
        description: params[1],
        course: params[2],
        deadline: params[3],
        priority: params[4],
        status: params[5],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockTable.push(newItem);
      return { rows: [newItem], rowCount: 1 };
    }
    // UPDATE STATUS
    if (sql.includes('SET status = $1')) {
      const id = params[1];
      const item = mockTable.find(t => t.id === id);
      if (item) {
        item.status = params[0];
        item.updated_at = new Date().toISOString();
        return { rows: [item], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    // DELETE
    if (sql.includes('DELETE FROM tasks WHERE id = $1')) {
      const id = params[0];
      const idx = mockTable.findIndex(t => t.id === id);
      if (idx !== -1) {
        const deleted = mockTable.splice(idx, 1)[0];
        return { rows: [deleted], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    return { rows: [], rowCount: 0 };
  };

  try {
    // 8a. Membaca daftar tugas
    const listRes = await request('/api/tasks');
    assert.equal(listRes.status, 200);
    assert.equal(listRes.data.success, true);
    assert.equal(listRes.data.count, 1);
    assert.equal(listRes.data.data[0].title, 'UJI-PERSISTENSI-DOCKER');

    // 8b. Membaca ringkasan statistik
    const summaryRes = await request('/api/tasks/summary');
    assert.equal(summaryRes.status, 200);
    assert.equal(summaryRes.data.data.total_tasks, 1);

    // 8c. Membuat tugas baru
    const createRes = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Tugas Praktikum Mandiri Baru',
        course: 'Keamanan Jaringan',
        deadline: '2026-11-10',
        priority: 'medium',
        status: 'pending'
      })
    });
    assert.equal(createRes.status, 201);
    assert.equal(createRes.data.success, true);
    assert.equal(createRes.data.data.title, 'Tugas Praktikum Mandiri Baru');

    // 8d. Mengubah status tugas
    const patchRes = await request('/api/tasks/1/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' })
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.data.data.status, 'completed');

    // 8e. Menghapus tugas
    const deleteRes = await request('/api/tasks/1', {
      method: 'DELETE'
    });
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.data.success, true);

    // 8f. Menghapus tugas yang tidak ada
    const notFoundDelete = await request('/api/tasks/999', {
      method: 'DELETE'
    });
    assert.equal(notFoundDelete.status, 404);
  } finally {
    // Kembalikan db.query asli
    db.query = originalQuery;
  }
});
