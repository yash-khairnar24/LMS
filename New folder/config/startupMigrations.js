const db = require('./db');

const runStartupMigrations = async () => {
  try {
    // Ensure users.role supports business on existing databases
    await db.execute(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('teacher','student','business') NOT NULL
    `);

    // Backfill any legacy/invalid blank roles to business
    await db.execute(`
      UPDATE users
      SET role = 'business'
      WHERE role = '' OR role IS NULL
    `);

    // Ensure business meetings table exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS business_meetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        meeting_code VARCHAR(20) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_business_meetings_host (host_id),
        INDEX idx_business_meetings_code (meeting_code),
        FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS business_meeting_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        meeting_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_business_meeting_user (meeting_id, user_id),
        INDEX idx_bmp_meeting (meeting_id),
        INDEX idx_bmp_user (user_id),
        FOREIGN KEY (meeting_id) REFERENCES business_meetings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Startup migrations completed.');
  } catch (error) {
    console.error('Startup migrations failed:', error.message);
  }
};

module.exports = { runStartupMigrations };
