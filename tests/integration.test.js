/**
 * INTEGRATION TEST SUITE (REAL POSTGRESQL - ZERO MOCKS)
 * Menjalankan pengujian integrasi end-to-end langsung terhadap instance PostgreSQL
 * dan Express HTTP Server.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const db = require('../src/database/db');
const { migrate } = require('../src/database/migrate');
const config = require('../src/config/environment');

let server;
let baseUrl;

test.before(async () => {
  // 1. Cek apakah PostgreSQL dapat dihubungi
  console.log(`[Integration Test] Menghubungkan ke PostgreSQL di ${config.db.host}:${config.db.port}...`);
  const isConnected = await db.checkConnection(3, 1000);
  if (!isConnected) {
    console.warn('[Integration Test] Database PostgreSQL belum dapat dihubungi.');
    console.warn('[Integration Test] Pastikan kontainer Docker database (student-task-db) aktif.');
    return;
  }

  // 2. Jalankan migrasi skema riil
  await migrate();

  // 3. Jalankan HTTP server Express
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[Integration Test] Server pengujian aktif di ${baseUrl}`);
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await db.closePool();
});

async function request(path, options = {}) {
  if (!baseUrl) {
    throw new Error('BLOCKED: Database offline / server belum aktif.');
  }
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

test('INTEGRASI NYATA: Verifikasi Koneksi Langsung PostgreSQL & Healthcheck', async (t) => {
  const isConnected = await db.checkConnection(1, 500);
  if (!isConnected) {
    t.skip('Database PostgreSQL belum terhubung. Uji integrasi dilewati.');
    return;
  }

  const res = await request('/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.status, 'OK');
  assert.equal(res.data.database.status, 'healthy');
});

test('INTEGRASI NYATA: Alur Lengkap CRUD pada PostgreSQL Sungguhan', async (t) => {
  const isConnected = await db.checkConnection(1, 500);
  if (!isConnected) {
    t.skip('Database PostgreSQL belum terhubung. Uji integrasi dilewati.');
    return;
  }

  let createdId = null;
  const uniqueTitle = `UJI-INTEGRASI-REAL-${Date.now()}`;

  // 1. CREATE: Tambah tugas baru ke database riil
  const createRes = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: uniqueTitle,
      description: 'Pengujian integrasi langsung dengan database PostgreSQL',
      course: 'Komputasi Awan',
      deadline: '2026-11-20',
      priority: 'high',
      status: 'pending'
    })
  });
  assert.equal(createRes.status, 201);
  assert.equal(createRes.data.success, true);
  assert.equal(createRes.data.data.title, uniqueTitle);
  createdId = createRes.data.data.id;
  assert.ok(createdId > 0, 'ID tugas harus berupa integer positif yang dihasilkan SERIAL');

  // Verifikasi langsung ke tabel database via SQL query
  const directCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [createdId]);
  assert.equal(directCheck.rows.length, 1);
  assert.equal(directCheck.rows[0].title, uniqueTitle);

  // 2. READ: Baca detail tugas via API
  const getRes = await request(`/api/tasks/${createdId}`);
  assert.equal(getRes.status, 200);
  assert.equal(getRes.data.data.id, createdId);
  assert.equal(getRes.data.data.priority, 'high');

  // 3. UPDATE: Edit data tugas
  const updateRes = await request(`/api/tasks/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: `${uniqueTitle} - UPDATED`,
      description: 'Deskripsi berhasil diperbarui',
      course: 'Komputasi Awan Lanjutan',
      deadline: '2026-11-25',
      priority: 'medium',
      status: 'in_progress'
    })
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data.data.title, `${uniqueTitle} - UPDATED`);
  assert.equal(updateRes.data.data.priority, 'medium');

  // 4. PATCH: Ubah status menjadi completed
  const patchRes = await request(`/api/tasks/${createdId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'completed' })
  });
  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.data.data.status, 'completed');

  // Verifikasi langsung ke database bahwa status berubah di PostgreSQL
  const dbStatusCheck = await db.query('SELECT status FROM tasks WHERE id = $1', [createdId]);
  assert.equal(dbStatusCheck.rows[0].status, 'completed');

  // 5. DELETE: Hapus tugas dari database riil
  const deleteRes = await request(`/api/tasks/${createdId}`, {
    method: 'DELETE'
  });
  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.data.success, true);

  // Verifikasi langsung ke database bahwa baris data telah terhapus
  const dbDeletedCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [createdId]);
  assert.equal(dbDeletedCheck.rows.length, 0, 'Data harus terhapus permanen dari PostgreSQL');
});
