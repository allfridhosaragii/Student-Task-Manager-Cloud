const path = require('path');
const dotenv = require('dotenv');

// Load .env from root of project if exists
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.APP_PORT || process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST || 'database',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || process.env.POSTGRES_DB || 'student_tasks',
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'taskuser',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'taskpass_cloud_2026',
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  }
};

module.exports = config;
