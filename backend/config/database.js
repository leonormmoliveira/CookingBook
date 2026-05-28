const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Optional TLS/SSL configuration for cloud DBs (e.g., TiDB Cloud)
let sslConfig;
if (process.env.DB_SSL_CA_PATH) {
  const caPath = path.resolve(process.env.DB_SSL_CA_PATH);
  try {
    sslConfig = { ca: fs.readFileSync(caPath) };
    console.info('Database SSL: using CA file at', caPath);
  } catch (e) {
    console.warn('Database SSL: failed to read CA file at', caPath, e.message);
  }
} else if (process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false') {
  // Developer option to allow insecure connections (not recommended)
  sslConfig = { rejectUnauthorized: false };
  console.warn('Database SSL: running with rejectUnauthorized=false (insecure)');
} else {
  console.info('Database SSL: no SSL CA configured; attempting default connection');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(sslConfig ? { ssl: sslConfig } : {})
});

module.exports = pool;
