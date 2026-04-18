-- PostgreSQL Schema for LMS Online Classroom
-- Run this in pgAdmin Query Tool after creating the 'online_classroom' database

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student', 'business')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  teacher_id INT NOT NULL,
  class_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lectures (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL,
  meeting_link VARCHAR(255) NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Plans: teacher defines feature bundles + price per class
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  feature_live_class BOOLEAN DEFAULT FALSE,
  feature_study_material BOOLEAN DEFAULT FALSE,
  feature_ask_doubt BOOLEAN DEFAULT FALSE,
  feature_recording BOOLEAN DEFAULT FALSE,
  feature_assignment BOOLEAN DEFAULT FALSE,
  feature_smart_test BOOLEAN DEFAULT FALSE,
  feature_chat BOOLEAN DEFAULT FALSE,
  feature_support BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Subscriptions: student subscribes to a plan (simulated payment)
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  plan_id INT NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, class_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Meetings: live sessions with shareable code
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  meeting_code VARCHAR(20) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Business meetings: non-class live sessions for business accounts
CREATE TABLE IF NOT EXISTS business_meetings (
  id SERIAL PRIMARY KEY,
  host_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  meeting_code VARCHAR(20) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_business_meetings_host ON business_meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_business_meetings_code ON business_meetings(meeting_code);

CREATE TABLE IF NOT EXISTS business_meeting_participants (
  id SERIAL PRIMARY KEY,
  meeting_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (meeting_id, user_id),
  FOREIGN KEY (meeting_id) REFERENCES business_meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_bmp_meeting ON business_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_bmp_user ON business_meeting_participants(user_id);

-- Advertisement requests: teacher submits, admin approves, students view approved ads
CREATE TABLE IF NOT EXISTS advertisements (
  id SERIAL PRIMARY KEY,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  button_text VARCHAR(100) DEFAULT 'Learn More',
  button_link VARCHAR(500) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_ads_status ON advertisements(status);
CREATE INDEX IF NOT EXISTS idx_ads_teacher ON advertisements(teacher_id);

-- Assignments: Teacher creates assignments for a class
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  max_marks INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Assignment Submissions: Students submit files for assignments
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  score INT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('pending', 'submitted', 'graded', 'overdue')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
