"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropSurveyTables = exports.createSurveyTables = void 0;
const db_1 = require("../utils/db");
const createSurveyTables = async () => {
    try {
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await db_1.pool.query(`
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
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS survey_submissions (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await db_1.pool.query(`
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
        await db_1.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON questions(survey_id);
    `);
        await db_1.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(survey_id, order_index);
    `);
        await db_1.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
    `);
        await db_1.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
    `);
        console.log('✅ Survey database tables created successfully');
    }
    catch (error) {
        console.error('❌ Error creating survey tables:', error);
        throw error;
    }
};
exports.createSurveyTables = createSurveyTables;
const dropSurveyTables = async () => {
    try {
        await db_1.pool.query('DROP TABLE IF EXISTS responses CASCADE');
        await db_1.pool.query('DROP TABLE IF EXISTS survey_submissions CASCADE');
        await db_1.pool.query('DROP TABLE IF EXISTS questions CASCADE');
        await db_1.pool.query('DROP TABLE IF EXISTS surveys CASCADE');
        console.log('✅ Survey tables dropped successfully');
    }
    catch (error) {
        console.error('❌ Error dropping survey tables:', error);
        throw error;
    }
};
exports.dropSurveyTables = dropSurveyTables;
