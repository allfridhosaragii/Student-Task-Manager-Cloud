const express = require('express');
const router = express.Router();
const { pool } = require('../database/db');
const config = require('../config/environment');

router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbLatencyMs = null;
  const startTime = Date.now();

  try {
    const dbRes = await pool.query('SELECT 1 AS alive');
    if (dbRes.rows[0]?.alive === 1) {
      dbStatus = 'healthy';
      dbLatencyMs = Date.now() - startTime;
    }
  } catch (err) {
    dbStatus = `unhealthy: ${err.message}`;
  }

  const isHealthy = dbStatus === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'student-task-manager',
    environment: config.env,
    database: {
      status: dbStatus,
      host: config.db.host,
      latency: dbLatencyMs ? `${dbLatencyMs}ms` : undefined
    }
  });
});

module.exports = router;
