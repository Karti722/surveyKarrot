import { pool } from '../utils/db';

export const createSurveyTables = async () => {
  try {
    // Create users table first if it doesn't exist (simple version)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create surveys table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('text', 'number', 'email', 'tel', 'textarea', 'select', 'radio', 'checkbox')),
        options JSONB,
        required BOOLEAN DEFAULT FALSE,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create survey_submissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_submissions (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create responses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_id VARCHAR(255) NOT NULL,
        answer TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON questions(survey_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(survey_id, order_index);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
    `);

    console.log('✅ Survey database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating survey tables:', error);
    throw error;
  }
};

export const dropSurveyTables = async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS responses CASCADE');
    await pool.query('DROP TABLE IF EXISTS survey_submissions CASCADE');
    await pool.query('DROP TABLE IF EXISTS questions CASCADE');
    await pool.query('DROP TABLE IF EXISTS surveys CASCADE');
    console.log('✅ Survey tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping survey tables:', error);
    throw error;
  }
};
