import express from 'express';
const router = express.Router();
import {
  getSurveys,
  getSurvey,
  createSurvey,
  addQuestionToSurvey,
  submitSurveyResponse,
  getSurveySubmission,
  createSampleSurvey,
  getUserSubmissions,
  deleteUserSubmission,
  downloadAllSurveyData,
  getAllSurveySubmissions,
  getUserSubmissionsByUsername,
  getSurveySubmissionByIdController
} from '../controllers/surveyController';

// Add this route after router is declared
router.get('/user-submissions/:username', getUserSubmissionsByUsername);
// Admin: get all survey submissions
router.get('/admin/all-submissions', getAllSurveySubmissions);
// Admin: download all survey data (json/csv/txt)
router.post('/admin/download-survey-data', downloadAllSurveyData);

// Public routes - no authentication required
router.get('/surveys', getSurveys);
router.get('/surveys/:id', getSurvey);
router.post('/surveys/:id/submit', submitSurveyResponse);
router.get('/submissions/:sessionId', getSurveySubmission);
// New: get a single submission by its DB id
router.get('/surveys/submissions/:id', getSurveySubmissionByIdController);

// Authenticated user: get all their submissions
router.get('/my-submissions', getUserSubmissions);
// Authenticated user: delete one of their submissions
router.delete('/my-submissions/:submissionId', deleteUserSubmission);

// Admin routes - could add authentication later
router.post('/surveys', createSurvey);
router.post('/surveys/:id/questions', addQuestionToSurvey);

// Utility route for development
router.post('/surveys/sample/create', createSampleSurvey);

export default router;