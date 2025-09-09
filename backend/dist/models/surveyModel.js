"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurveySubmissionByUsername = exports.getSurveySubmissionBySession = exports.createSurveySubmission = exports.getResponsesBySession = exports.createResponse = exports.getQuestionsBySurveyId = exports.createQuestion = exports.getSurveyById = exports.getSurveys = exports.createSurvey = exports.deleteSurveySubmission = exports.deleteUserSubmissions = exports.getSurveySubmissionByUser = exports.getAllSurveySubmissions = exports.getSurveySubmissionById = void 0;
const getSurveySubmissionById = async (submissionId) => {
    const result = await db_1.pool.query(`SELECT ss.*, s.title as survey_title, s.created_at as survey_created_at,
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
     GROUP BY ss.id, s.title, s.created_at`, [submissionId]);
    return result.rows[0] || null;
};
exports.getSurveySubmissionById = getSurveySubmissionById;
const getAllSurveySubmissions = async () => {
    const result = await db_1.pool.query(`SELECT ss.*, s.title as survey_title, s.created_at as survey_created_at,
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
     GROUP BY ss.id, s.title, s.created_at`);
    return result.rows || [];
};
exports.getAllSurveySubmissions = getAllSurveySubmissions;
const getSurveySubmissionByUser = async (userId) => {
    const result = await db_1.pool.query(`SELECT ss.*, s.title as survey_title, s.created_at as survey_created_at,
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
     GROUP BY ss.id, s.title, s.created_at`, [userId]);
    console.log('User submissions found:', userId);
    return result.rows;
};
exports.getSurveySubmissionByUser = getSurveySubmissionByUser;
const deleteUserSubmissions = async (userId) => {
    const submissions = await db_1.pool.query('SELECT id FROM survey_submissions WHERE user_id = $1', [userId]);
    for (const row of submissions.rows) {
        await (0, exports.deleteSurveySubmission)(row.id);
    }
};
exports.deleteUserSubmissions = deleteUserSubmissions;
const deleteSurveySubmission = async (submissionId) => {
    await db_1.pool.query('DELETE FROM responses WHERE session_id = (SELECT session_id FROM survey_submissions WHERE id = $1)', [submissionId]);
    await db_1.pool.query('DELETE FROM survey_submissions WHERE id = $1', [submissionId]);
};
exports.deleteSurveySubmission = deleteSurveySubmission;
const db_1 = require("../utils/db");
const createSurvey = async (survey) => {
    const result = await db_1.pool.query('INSERT INTO surveys (title, description) VALUES ($1, $2) RETURNING *', [survey.title, survey.description]);
    return result.rows[0];
};
exports.createSurvey = createSurvey;
const getSurveys = async () => {
    const result = await db_1.pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    return result.rows;
};
exports.getSurveys = getSurveys;
const getSurveyById = async (id) => {
    const result = await db_1.pool.query('SELECT * FROM surveys WHERE id = $1', [id]);
    return result.rows[0] || null;
};
exports.getSurveyById = getSurveyById;
const createQuestion = async (question) => {
    try {
        console.log('createQuestion called with:', JSON.stringify(question, null, 2));
        console.log('Options value before DB insert:', question.options);
        const result = await db_1.pool.query('INSERT INTO questions (survey_id, title, description, question_type, options, required, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [question.survey_id, question.title, question.description, question.question_type,
            question.options ? JSON.stringify(question.options) : null, question.required, question.order_index]);
        const row = result.rows[0];
        console.log('DB returned row:', row);
        return {
            ...row,
            options: (() => {
                if (!row.options)
                    return null;
                if (Array.isArray(row.options))
                    return row.options;
                if (typeof row.options === 'string') {
                    try {
                        return JSON.parse(row.options);
                    }
                    catch {
                        return row.options.split(',');
                    }
                }
                return null;
            })()
        };
    }
    catch (error) {
        console.error('Error creating question:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            if (error.detail) {
                console.error('Error detail:', error.detail);
            }
            if (error.hint) {
                console.error('Error hint:', error.hint);
            }
            if (error.code) {
                console.error('Error code:', error.code);
            }
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }
        }
        else {
            console.error('Unknown error object:', error);
        }
        throw error;
    }
};
exports.createQuestion = createQuestion;
const getQuestionsBySurveyId = async (surveyId) => {
    try {
        const result = await db_1.pool.query('SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index ASC', [surveyId]);
        return result.rows.map(row => {
            try {
                return {
                    ...row,
                    options: (() => {
                        if (!row.options)
                            return null;
                        if (Array.isArray(row.options))
                            return row.options;
                        if (typeof row.options === 'string') {
                            try {
                                return JSON.parse(row.options);
                            }
                            catch {
                                return row.options.split(',');
                            }
                        }
                        return null;
                    })()
                };
            }
            catch (parseError) {
                console.error('Error parsing options for question:', row.id, parseError);
                return {
                    ...row,
                    options: null
                };
            }
        });
    }
    catch (error) {
        console.error('Error getting questions by survey ID:', surveyId, error);
        throw error;
    }
};
exports.getQuestionsBySurveyId = getQuestionsBySurveyId;
const createResponse = async (response) => {
    const result = await db_1.pool.query('INSERT INTO responses (survey_id, question_id, user_id, session_id, answer) VALUES ($1, $2, $3, $4, $5) RETURNING *', [response.survey_id, response.question_id, response.user_id, response.session_id, response.answer]);
    return result.rows[0];
};
exports.createResponse = createResponse;
const getResponsesBySession = async (sessionId) => {
    const result = await db_1.pool.query('SELECT * FROM responses WHERE session_id = $1', [sessionId]);
    return result.rows;
};
exports.getResponsesBySession = getResponsesBySession;
const createSurveySubmission = async (submission) => {
    const result = await db_1.pool.query('INSERT INTO survey_submissions (survey_id, user_id, session_id) VALUES ($1, $2, $3) RETURNING *', [submission.survey_id, submission.user_id, submission.session_id]);
    return result.rows[0];
};
exports.createSurveySubmission = createSurveySubmission;
const getSurveySubmissionBySession = async (sessionId) => {
    const result = await db_1.pool.query(`SELECT ss.*, s.title as survey_title, s.created_at as survey_created_at,
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
     GROUP BY ss.id, s.title, s.created_at`, [sessionId]);
    return result.rows[0] || null;
};
exports.getSurveySubmissionBySession = getSurveySubmissionBySession;
const getSurveySubmissionByUsername = async (usernameOrEmail) => {
    const userResult = await db_1.pool.query('SELECT id FROM users WHERE username = $1 OR email = $1', [usernameOrEmail]);
    const user = userResult.rows[0];
    if (!user)
        return [];
    const userId = user.id;
    return (0, exports.getSurveySubmissionByUser)(userId);
};
exports.getSurveySubmissionByUsername = getSurveySubmissionByUsername;
