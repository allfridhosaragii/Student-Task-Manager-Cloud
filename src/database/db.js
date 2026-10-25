const { Pool } = require('pg');
const config = require('../config/environment');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: config.db.max,
  idleTimeoutMillis: config.db.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.connectionTimeoutMillis
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.env === 'development') {
    console.log('[DB Query]', { text, duration: `${duration}ms`, rows: res.rowCount });
  }
  return res;
}

async function checkConnection(retries = 5, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await pool.query('SELECT NOW() AS current_time');
      console.log(`[DB] Connected successfully to PostgreSQL at ${config.db.host}:${config.db.port} (${res.rows[0].current_time})`);
      return true;
    } catch (err) {
      console.warn(`[DB] Connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}

async function closePool() {
  console.log('[DB] Closing database connection pool...');
  await pool.end();
  console.log('[DB] Database connection pool closed.');
}

module.exports = {
  pool,
  query,
  checkConnection,
  closePool
};
