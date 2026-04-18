const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'online_classroom'
  });

  try {
    await client.connect();

    // PostgreSQL equivalent of maintaining allowed role values.
    await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
    await client.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('teacher', 'student', 'business'));
    `);

    // Backfill any legacy null/blank values.
    await client.query(`
      UPDATE users
      SET role = 'business'
      WHERE role IS NULL OR role = '';
    `);

    console.log('Users role constraint updated for PostgreSQL.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
