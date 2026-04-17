const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: 'online_classroom'
  });
  
  try {
    await c.query("ALTER TABLE users MODIFY COLUMN role ENUM('teacher', 'student', 'business') NOT NULL;");
    console.log('Successfully updated ENUM');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    c.end();
  }
}
run();
