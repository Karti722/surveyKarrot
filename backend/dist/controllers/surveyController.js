"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSubmissionsByUsername = exports.createSampleSurvey = exports.getSurveySubmission = exports.submitSurveyResponse = exports.addQuestionToSurvey = exports.createSurvey = exports.getSurvey = exports.getSurveys = exports.deleteUserSubmission = exports.getUserSubmissions = exports.downloadAllSurveyData = exports.getAllSurveySubmissions = exports.getSurveySubmissionByIdController = void 0;
const surveyModel_1 = require("../models/surveyModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const surveyModel_2 = require("../models/surveyModel");
const getSurveySubmissionByIdController = async (req, res) => {
    try {
        const submissionId = parseInt(req.params.id);
        if (isNaN(submissionId)) {
            return res.status(400).json({ error: 'Invalid submission ID' });
        }
        const submission = await (0, surveyModel_1.getSurveySubmissionById)(submissionId);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.json(submission);
    }
    catch (error) {
        console.error('Error fetching submission by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getSurveySubmissionByIdController = getSurveySubmissionByIdController;
const getAllSurveySubmissions = async (req, res) => {
    let token = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('[ADMIN ENDPOINT] Using Bearer token from Authorization header.');
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
        console.log('[ADMIN ENDPOINT] Using token from cookies.');
    }
    else {
        console.warn('[ADMIN ENDPOINT] No token found in Authorization header or cookies.');
    }
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated: No token provided in header or cookie.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('[ADMIN ENDPOINT] Decoded token:', decoded);
        if (!decoded.role) {
            console.warn('[ADMIN ENDPOINT] Token does not contain a role:', decoded);
            return res.status(401).json({ error: 'Invalid token: No role in token.' });
        }
        if (decoded.role !== 'admin') {
            console.warn('[ADMIN ENDPOINT] User is not admin:', decoded);
            return res.status(403).json({ error: 'Forbidden: Admins only' });
        }
        const submissions = await surveyService_1.surveyService.getAllSurveySubmissions();
        res.json(submissions);
    }
    catch (e) {
        console.error('[ADMIN ENDPOINT] Token verification failed:', e);
        return res.status(401).json({ error: 'Invalid token: ' + (e instanceof Error ? e.message : String(e)) });
    }
};
exports.getAllSurveySubmissions = getAllSurveySubmissions;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const downloadAllSurveyData = async (req, res) => {
    let token = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('[ADMIN ENDPOINT] Using Bearer token from Authorization header.');
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
        console.log('[ADMIN ENDPOINT] Using token from cookies.');
    }
    else {
        console.warn('[ADMIN ENDPOINT] No token found in Authorization header or cookies.');
    }
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated: No token provided in header or cookie.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('[ADMIN ENDPOINT] Decoded token:', decoded);
        if (!decoded.role) {
            console.warn('[ADMIN ENDPOINT] Token does not contain a role:', decoded);
            return res.status(401).json({ error: 'Invalid token: No role in token.' });
        }
        if (decoded.role !== 'admin') {
            console.warn('[ADMIN ENDPOINT] User is not admin:', decoded);
            return res.status(403).json({ error: 'Forbidden: Admins only' });
        }
        const surveys = await surveyService_1.surveyService.getAllSurveys();
        const fileType = req.body.downloadFileType || 'json';
        let fileContent = '';
        let fileExt = 'json';
        if (fileType === 'csv') {
            fileExt = 'csv';
            const rows = [];
            rows.push('survey_id,survey_title,survey_description,question_id,question_title,question_type,question_required,question_order');
            for (const survey of surveys) {
                const questions = await surveyService_1.surveyService.getQuestions(survey.id);
                for (const q of questions) {
                    rows.push(`${survey.id},"${survey.title}","${survey.description || ''}",${q.id},"${q.title}",${q.question_type},${q.required},${q.order_index}`);
                }
            }
            fileContent = rows.join('\n');
        }
        else if (fileType === 'txt') {
            fileExt = 'txt';
            fileContent = JSON.stringify(surveys, null, 2);
        }
        else {
            fileExt = 'json';
            fileContent = JSON.stringify(surveys, null, 2);
        }
        const fileName = `survey_data_${Date.now()}.${fileExt}`;
        const filePath = path_1.default.join(__dirname, '../../downloads', fileName);
        fs_1.default.writeFileSync(filePath, fileContent);
        res.download(filePath, fileName, err => {
            if (err) {
                res.status(500).json({ error: 'File download failed' });
            }
            else {
                setTimeout(() => { try {
                    fs_1.default.unlinkSync(filePath);
                }
                catch { } }, 10000);
            }
        });
    }
    catch (e) {
        console.error('[ADMIN ENDPOINT] Token verification failed:', e);
        return res.status(401).json({ error: 'Invalid token: ' + (e instanceof Error ? e.message : String(e)) });
    }
};
exports.downloadAllSurveyData = downloadAllSurveyData;
const getUserSubmissions = async (req, res) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    let headerToken = undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        headerToken = authHeader.split(' ')[1];
    }
    const token = cookieToken || headerToken;
    console.log('getUserSubmissions: Authorization header:', authHeader);
    console.log('getUserSubmissions: Cookie token:', cookieToken);
    console.log('getUserSubmissions: Header token:', headerToken);
    console.log('getUserSubmissions: Using token:', token);
    if (!token)
        return res.status(401).json({ error: 'Not authenticated' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const submissions = await (0, surveyModel_2.getSurveySubmissionByUser)(userId);
        return res.json({ submissions });
    }
    catch (err) {
        console.error('getUserSubmissions: Invalid token error:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.getUserSubmissions = getUserSubmissions;
const deleteUserSubmission = async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Not authenticated' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const submissionId = parseInt(req.params.submissionId);
        const submissions = await (0, surveyModel_2.getSurveySubmissionByUser)(userId);
        if (!submissions.some((s) => s.id === submissionId)) {
            return res.status(403).json({ error: 'Not authorized to delete this submission' });
        }
        await (0, surveyModel_2.deleteSurveySubmission)(submissionId);
        return res.json({ message: 'Submission deleted' });
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.deleteUserSubmission = deleteUserSubmission;
const surveyService_1 = require("../services/surveyService");
const getSurveys = async (req, res) => {
    try {
        const surveys = await surveyService_1.surveyService.getAllSurveys();
        res.json(surveys);
    }
    catch (error) {
        console.error('Error fetching surveys:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getSurveys = getSurveys;
const getSurvey = async (req, res) => {
    try {
        const surveyId = parseInt(req.params.id);
        console.log(`Getting survey with ID: ${surveyId}`);
        if (isNaN(surveyId)) {
            return res.status(400).json({ error: 'Invalid survey ID' });
        }
        const survey = await surveyService_1.surveyService.getSurveyWithQuestions(surveyId);
        if (!survey) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        console.log(`Found survey: ${survey.title} with ${survey.questions.length} questions`);
        res.json(survey);
    }
    catch (error) {
        console.error('Error fetching survey:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getSurvey = getSurvey;
const createSurvey = async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Survey title is required' });
        }
        const survey = await (0, surveyService_1.createSurveyWithQuestions)(title, description, questions);
        res.status(201).json(survey);
    }
    catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createSurvey = createSurvey;
const addQuestionToSurvey = async (req, res) => {
    try {
        const surveyId = parseInt(req.params.id);
        const { title, description, questionType, options, required } = req.body;
        if (!title || !questionType) {
            return res.status(400).json({ error: 'Question title and type are required' });
        }
        const question = await surveyService_1.surveyService.addQuestionToSurvey(surveyId, title, questionType, description, options, required);
        res.status(201).json(question);
    }
    catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.addQuestionToSurvey = addQuestionToSurvey;
const submitSurveyResponse = async (req, res) => {
    try {
        const surveyId = parseInt(req.params.id);
        const { responses } = req.body;
        if (!responses || !Array.isArray(responses)) {
            return res.status(400).json({ error: 'Responses are required and must be an array' });
        }
        for (const response of responses) {
            if (!response.questionId || response.answer === undefined) {
                return res.status(400).json({
                    error: 'Each response must have questionId and answer'
                });
            }
        }
        console.log('Request body user:', req.body.user);
        let userId = req.user ? req.user.id : undefined;
        if (!userId && req.body.user && req.body.user.id) {
            userId = req.body.user.id;
        }
        const result = await surveyService_1.surveyService.submitSurveyResponse(surveyId, responses, userId);
        res.status(201).json({
            message: 'Survey response submitted successfully',
            sessionId: result.sessionId,
            submissionId: result.submissionId
        });
    }
    catch (error) {
        console.error('Error submitting survey response:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.submitSurveyResponse = submitSurveyResponse;
const getSurveySubmission = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const submission = await surveyService_1.surveyService.getSurveySubmission(sessionId);
        if (!submission) {
            return res.status(404).json({ error: 'Survey submission not found' });
        }
        res.json(submission);
    }
    catch (error) {
        console.error('Error fetching survey submission:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getSurveySubmission = getSurveySubmission;
const createSampleSurvey = async (req, res) => {
    try {
        console.log('Creating sample survey...');
        const survey = await surveyService_1.surveyService.createSampleSurvey();
        console.log(`Sample survey created with ID: ${survey.id}`);
        res.status(201).json({
            message: 'Sample survey created successfully',
            survey
        });
    }
    catch (error) {
        console.error('Error creating sample survey:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createSampleSurvey = createSampleSurvey;
const surveyModel_3 = require("../models/surveyModel");
const getUserSubmissionsByUsername = async (req, res) => {
    const { username } = req.params;
    if (!username)
        return res.status(400).json({ error: 'Username required' });
    try {
        const submissions = await (0, surveyModel_3.getSurveySubmissionByUsername)(username);
        return res.json({ submissions });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch submissions by username' });
    }
};
exports.getUserSubmissionsByUsername = getUserSubmissionsByUsername;
