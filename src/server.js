const app = require('./app');
const config = require('./config/environment');
const { migrate } = require('./database/migrate');
const { closePool } = require('./database/db');

const HOST = '0.0.0.0'; // Bind to all interfaces for container networking
const PORT = config.port;

let server;

async function startServer() {
  try {
    console.log('====================================================');
    console.log('       STUDENT TASK MANAGER - CLOUD APPLICATION     ');
    console.log('====================================================');
    console.log(`[Config] Environment : ${config.env}`);
    console.log(`[Config] App Port    : ${PORT}`);
    console.log(`[Config] DB Host     : ${config.db.host}:${config.db.port}`);
    console.log(`[Config] DB Name     : ${config.db.name}`);

    // Run database migrations on start (with retries)
    try {
      await migrate();
    } catch (migErr) {
      console.warn(`[Server] Database migration warning: ${migErr.message}`);
      console.warn('[Server] Will continue server startup. Ensure database service is reachable.');
    }

    server = app.listen(PORT, HOST, () => {
      console.log(`[Server] HTTP server listening on http://${HOST}:${PORT}`);
      console.log(`[Server] Healthcheck endpoint: http://${HOST}:${PORT}/health`);
      console.log(`[Server] Tasks API endpoint  : http://${HOST}:${PORT}/api/tasks`);
    });

  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.');
    });
  }

  try {
    await closePool();
    console.log('[Server] Graceful shutdown completed.');
    process.exit(0);
  } catch (err) {
    console.error('[Server] Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
