const { Pool } = require('pg');

const connectionUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL;

let poolConfig;

if (connectionUrl) {
  console.log('[DB] Connecting to PostgreSQL via connection string...');
  poolConfig = {
    connectionString: connectionUrl,
    max: 5,
    idleTimeoutMillis: 10000,
    ssl:
      connectionUrl.includes('localhost') ||
      connectionUrl.includes('@db:')
        ? false
        : { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  };
} else if (process.env.PGHOST) {
  console.log('[DB] Connecting to PostgreSQL via PGHOST:', process.env.PGHOST);
  poolConfig = {
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.PGDATABASE || process.env.POSTGRES_DATABASE || 'neondb',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  };
} else {
  console.warn('[DB] No database connection string found in environment variables!');
  console.warn(
    '[DB] Available env keys:',
    Object.keys(process.env)
      .filter((k) => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('TOKEN'))
      .join(', ')
  );
  poolConfig = {
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'erp_db',
    connectionTimeoutMillis: 5000,
  };
}

// Cache pool across serverless function invocations to avoid reconnection overhead
if (!global._erpPgPool) {
  global._erpPgPool = new Pool({
    ...poolConfig,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  global._erpPgPool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });
}

const pool = global._erpPgPool;

async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    console.log('Connected to PostgreSQL successfully at:', res.rows[0].now);
    return true;
  } catch (err) {
    console.warn('PostgreSQL connection check failed:', err.message);
    return false;
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection,
};
