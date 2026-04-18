const db = require('./db');

const runStartupMigrations = async () => {
  try {
    // Ensure users.role supports business on existing databases
    await db.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `);
    
    await db.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('teacher', 'student', 'business'));
    `);

    // Backfill any legacy/invalid blank roles to business
    await db.query(`
      UPDATE users
      SET role = 'business'
      WHERE role = '' OR role IS NULL
    `);

    // Ensure business meetings table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS business_meetings (
        id SERIAL PRIMARY KEY,
        host_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        meeting_code VARCHAR(20) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_business_meetings_host ON business_meetings (host_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_business_meetings_code ON business_meetings (meeting_code);
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS business_meeting_participants (
        id SERIAL PRIMARY KEY,
        meeting_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (meeting_id, user_id),
        FOREIGN KEY (meeting_id) REFERENCES business_meetings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_bmp_meeting ON business_meeting_participants (meeting_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_bmp_user ON business_meeting_participants (user_id);
    `);

    console.log('Startup migrations completed.');
  } catch (error) {
    console.error('Startup migrations failed:', error.message);
  }
};

module.exports = { runStartupMigrations };
