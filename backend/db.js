const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let pool;

// Check if external Postgres credentials are provided and not standard dummy localhost
const hasExternalPostgres = Boolean(
  process.env.DATABASE_URL ||
  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')
);

if (hasExternalPostgres) {
  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      };
  pool = new Pool(poolConfig);
} else {
  // Use persistent embedded PostgreSQL engine (PGlite)
  const { PGlite } = require('@electric-sql/pglite');
  const dataDir = path.join(__dirname, 'data', 'pgdata');
  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  }

  const pglite = new PGlite(dataDir);

  // Implement the standard pg.Pool interface
  pool = {
    async query(text, params = []) {
      try {
        if (params && params.length > 0) {
          return await pglite.query(text, params);
        }
        if (text.includes(';') && (text.includes('CREATE TABLE') || text.includes('INSERT INTO'))) {
          await pglite.exec(text);
          return { rows: [] };
        }
        return await pglite.query(text);
      } catch (err) {
        console.error('Database Query Error:', err.message, '\nSQL:', text.substring(0, 100));
        throw err;
      }
    },
    async exec(text) {
      return await pglite.exec(text);
    },
    async connect() {
      return {
        query: (text, params) => pool.query(text, params),
        exec: (text) => pglite.exec(text),
        release: () => {},
      };
    },
    async end() {
      return await pglite.close();
    },
    _isPGlite: true,
  };
}

module.exports = pool;
