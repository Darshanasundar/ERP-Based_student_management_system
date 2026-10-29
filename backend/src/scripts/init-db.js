const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function initializeDatabase() {
  console.log('Running database schema initialization...');

  // Search candidate paths for init.sql
  const candidatePaths = [
    path.join(__dirname, '../../../database/init.sql'),
    path.join(__dirname, '../../database/init.sql'),
    path.join(process.cwd(), 'database/init.sql'),
    path.join(process.cwd(), '../database/init.sql'),
  ];

  let sqlPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!sqlPath) {
    console.error('Could not find database/init.sql file in expected paths.');
    process.exit(1);
  }

  console.log(`Loading schema from: ${sqlPath}`);
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL. Executing DDL statements...');
    await client.query(sqlContent);
    client.release();
    console.log('Database initialized successfully with tables, triggers, and seed data!');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

initializeDatabase();
