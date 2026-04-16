const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'admin',
      multipleStatements: true
    });

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await connection.query(sql);
    console.log('Database and tables initialized successfully.');

    await connection.end();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDB();
