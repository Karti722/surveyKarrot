// Get a single submission by its ID (with survey title and responses)
export const getSurveySubmissionById = async (submissionId: number) => {
  const result = await pool.query(
    `SELECT ss.*, s.title as survey_title, s.created_at as survey_created_at,
       json_agg(
         json_build_object(
           'id', r.id,
           'question_id', r.question_id,
           'answer', r.answer,
           'submitted_at', r.submitted_at
         )
       ) as responses
     FROM survey_submissions ss
     JOIN surveys s ON ss.survey_id = s.id
     LEFT JOIN responses r ON ss.session_id = r.session_id
     WHERE ss.id = $1
     GROUP BY ss.id, s.title, s.created_at`,
    [submissionId]
  );
  return result.rows[0] || null;
};
// Get all survey submissions (admin)
export const getAllSurveySubmissions = async (): Promise<SurveySubmission[]> => {
  const result = await pool.query(
    `SELECT ss.*, s.title as survey_title, s.created_at as survey_created_at,
       json_agg(
         json_build_object(
           'id', r.id,
           'question_id', r.question_id,
           'answer', r.answer,
           'submitted_at', r.submitted_at
         )
       ) as responses
     FROM survey_submissions ss
     JOIN surveys s ON ss.survey_id = s.id
     LEFT JOIN responses r ON ss.session_id = r.session_id
     GROUP BY ss.id, s.title, s.created_at`
  );
  return result.rows || [];
};
// Get all submissions for a user
export const getSurveySubmissionByUser = async (userId: number): Promise<SurveySubmission[]> => {
  const result = await pool.query(
    `SELECT ss.*, s.title as survey_title, s.created_at as survey_created_at,
       json_agg(
         json_build_object(
           'id', r.id,
           'question_id', r.question_id,
           'answer', r.answer,
           'submitted_at', r.submitted_at
         )
       ) as responses
     FROM survey_submissions ss
     JOIN surveys s ON ss.survey_id = s.id
     LEFT JOIN responses r ON ss.session_id = r.session_id
     WHERE ss.user_id = $1
     GROUP BY ss.id, s.title, s.created_at`,
    [userId]
  );
  return result.rows;
};
// Delete all submissions and responses for a user
export const deleteUserSubmissions = async (userId: number) => {
  // Get all submission ids for this user
  const submissions = await pool.query('SELECT id FROM survey_submissions WHERE user_id = $1', [userId]);
  for (const row of submissions.rows) {
    await deleteSurveySubmission(row.id);
  }
};

// Delete a single submission and its responses
export const deleteSurveySubmission = async (submissionId: number) => {
  // Delete responses
  await pool.query('DELETE FROM responses WHERE session_id = (SELECT session_id FROM survey_submissions WHERE id = $1)', [submissionId]);
  // Delete submission
  await pool.query('DELETE FROM survey_submissions WHERE id = $1', [submissionId]);
};
import { pool } from '../utils/db';

export interface Survey {
  id: number;
  title: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Question {
  id: number;
  survey_id: number;
  title: string;
  description?: string;
  question_type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[]; // For select, radio, checkbox types
  required: boolean;
  order_index: number;
}

export interface Response {
  id: number;
  survey_id: number;
  question_id: number;
  user_id?: number;
  session_id: string; // For anonymous responses
  answer: string;
  submitted_at: Date;
}

export interface SurveySubmission {
  id: number;
  survey_id: number;
  user_id?: number;
  session_id: string;
  submitted_at: Date;
  responses: Response[];
}

// Survey CRUD operations
export const createSurvey = async (survey: Omit<Survey, 'id' | 'created_at' | 'updated_at'>): Promise<Survey> => {
  const result = await pool.query(
    'INSERT INTO surveys (title, description) VALUES ($1, $2) RETURNING *',
    [survey.title, survey.description]
  );
  return result.rows[0];
};

export const getSurveys = async (): Promise<Survey[]> => {
  const result = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
  return result.rows;
};

export const getSurveyById = async (id: number): Promise<Survey | null> => {
  const result = await pool.query('SELECT * FROM surveys WHERE id = $1', [id]);
  return result.rows[0] || null;
};

// Question CRUD operations
export const createQuestion = async (question: Omit<Question, 'id'>): Promise<Question> => {
  try {
    const result = await pool.query(
      'INSERT INTO questions (survey_id, title, description, question_type, options, required, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [question.survey_id, question.title, question.description, question.question_type, 
       question.options ? JSON.stringify(question.options) : null, question.required, question.order_index]
    );
    const row = result.rows[0];
    return {
      ...row,
      options: (() => {
        if (!row.options) return null;
        if (Array.isArray(row.options)) return row.options;
        if (typeof row.options === 'string') {
          try { return JSON.parse(row.options); } catch { return row.options.split(','); }
        }
        return null;
      })()
    };
  } catch (error) {
    if (error instanceof Error) {
      if ((error as any).detail) {
        console.error('Error detail:', (error as any).detail);
      }
      if ((error as any).hint) {
        console.error('Error hint:', (error as any).hint);
      }
      if ((error as any).code) {
        console.error('Error code:', (error as any).code);
      }
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } else {
      console.error('Unknown error object:', error);
    }
    throw error;
  }
};

export const getQuestionsBySurveyId = async (surveyId: number): Promise<Question[]> => {
  try {
    const result = await pool.query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index ASC',
      [surveyId]
    );
    return result.rows.map(row => {
      try {
        return {
          ...row,
          options: (() => {
            if (!row.options) return null;
            if (Array.isArray(row.options)) return row.options;
            if (typeof row.options === 'string') {
              try { return JSON.parse(row.options); } catch { return row.options.split(','); }
            }
            return null;
          })()
        };
      } catch (parseError) {
        console.error('Error parsing options for question:', row.id, parseError);
        return {
          ...row,
          options: null
        };
      }
    });
  } catch (error) {
    console.error('Error getting questions by survey ID:', surveyId, error);
    throw error;
  }
};

// Response operations
export const createResponse = async (response: Omit<Response, 'id' | 'submitted_at'>): Promise<Response> => {
  const result = await pool.query(
    'INSERT INTO responses (survey_id, question_id, user_id, session_id, answer) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [response.survey_id, response.question_id, response.user_id, response.session_id, response.answer]
  );
  return result.rows[0];
};

export const getResponsesBySession = async (sessionId: string): Promise<Response[]> => {
  const result = await pool.query('SELECT * FROM responses WHERE session_id = $1', [sessionId]);
  return result.rows;
};

export const createSurveySubmission = async (submission: Omit<SurveySubmission, 'id' | 'submitted_at' | 'responses'>): Promise<SurveySubmission> => {
  const result = await pool.query(
    'INSERT INTO survey_submissions (survey_id, user_id, session_id) VALUES ($1, $2, $3) RETURNING *',
    [submission.survey_id, submission.user_id, submission.session_id]
  );
  return result.rows[0];
};

export const getSurveySubmissionBySession = async (sessionId: string): Promise<SurveySubmission | null> => {
  const result = await pool.query(
    `SELECT ss.*, s.title as survey_title, s.created_at as survey_created_at,
       json_agg(
         json_build_object(
           'id', r.id,
           'question_id', r.question_id,
           'answer', r.answer,
           'submitted_at', r.submitted_at
         )
       ) as responses
     FROM survey_submissions ss
     JOIN surveys s ON ss.survey_id = s.id
     LEFT JOIN responses r ON ss.session_id = r.session_id
     WHERE ss.session_id = $1
     GROUP BY ss.id, s.title, s.created_at`,
    [sessionId]
  );
  return result.rows[0] || null;
};

// Get all submissions for a user by username or email
export const getSurveySubmissionByUsername = async (usernameOrEmail: string): Promise<SurveySubmission[]> => {
  // Find user ID by username or email
  const userResult = await pool.query('SELECT id FROM users WHERE username = $1 OR email = $1', [usernameOrEmail]);
  const user = userResult.rows[0];
  if (!user) return [];
  const userId = user.id;
  // Reuse existing logic
  return getSurveySubmissionByUser(userId);
};
