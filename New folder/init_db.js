const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  const dbName = process.env.DB_NAME || 'online_classroom';
  
  try {
    // Step 1: Create Database if not exists
    const initialClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: 'postgres'
    });
    
    await initialClient.connect();
    
    const res = await initialClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await initialClient.query(`CREATE DATABASE ${dbName}`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
    await initialClient.end();

    // Step 2: Execute schema.sql
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: dbName
    });

    await client.connect();

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await client.query(sql);
    console.log('Database and tables initialized successfully.');

    await client.end();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDB();
