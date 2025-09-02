import { getSurveySubmissionById } from '../models/surveyModel';
import jwt from 'jsonwebtoken';
import { getSurveySubmissionByUser, deleteSurveySubmission } from '../models/surveyModel';

// Get a single submission by its ID (for detail page)
export const getSurveySubmissionByIdController = async (req: Request, res: Response) => {
  try {
    const submissionId = parseInt(req.params.id);
    if (isNaN(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }
    const submission = await getSurveySubmissionById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// Admin: Get all survey submissions
export const getAllSurveySubmissions = async (req: Request, res: Response) => {
  let token = undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('[ADMIN ENDPOINT] Using Bearer token from Authorization header.');
  } else if (req.cookies?.token) {
    token = req.cookies.token;
    console.log('[ADMIN ENDPOINT] Using token from cookies.');
  } else {
    console.warn('[ADMIN ENDPOINT] No token found in Authorization header or cookies.');
  }
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated: No token provided in header or cookie.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('[ADMIN ENDPOINT] Decoded token:', decoded);
    if (!decoded.role) {
      console.warn('[ADMIN ENDPOINT] Token does not contain a role:', decoded);
      return res.status(401).json({ error: 'Invalid token: No role in token.' });
    }
    if (decoded.role !== 'admin') {
      console.warn('[ADMIN ENDPOINT] User is not admin:', decoded);
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    const submissions = await surveyService.getAllSurveySubmissions();
    res.json(submissions);
  } catch (e) {
    console.error('[ADMIN ENDPOINT] Token verification failed:', e);
    return res.status(401).json({ error: 'Invalid token: ' + (e instanceof Error ? e.message : String(e)) });
  }
};
import fs from 'fs';
import path from 'path';
// Admin-only: Download all survey data as JSON, CSV, or TXT
export const downloadAllSurveyData = async (req: Request, res: Response) => {
  let token = undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('[ADMIN ENDPOINT] Using Bearer token from Authorization header.');
  } else if (req.cookies?.token) {
    token = req.cookies.token;
    console.log('[ADMIN ENDPOINT] Using token from cookies.');
  } else {
    console.warn('[ADMIN ENDPOINT] No token found in Authorization header or cookies.');
  }
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated: No token provided in header or cookie.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('[ADMIN ENDPOINT] Decoded token:', decoded);
    if (!decoded.role) {
      console.warn('[ADMIN ENDPOINT] Token does not contain a role:', decoded);
      return res.status(401).json({ error: 'Invalid token: No role in token.' });
    }
    if (decoded.role !== 'admin') {
      console.warn('[ADMIN ENDPOINT] User is not admin:', decoded);
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    // Get all surveys with questions
    const surveys = await surveyService.getAllSurveys();
    const fileType = req.body.downloadFileType || 'json';
    let fileContent = '';
    let fileExt = 'json';
    if (fileType === 'csv') {
      // Flatten surveys to CSV
      fileExt = 'csv';
      const rows = [];
      rows.push('survey_id,survey_title,survey_description,question_id,question_title,question_type,question_required,question_order');
      for (const survey of surveys) {
        const questions = await surveyService.getQuestions(survey.id);
        for (const q of questions) {
          rows.push(`${survey.id},"${survey.title}","${survey.description || ''}",${q.id},"${q.title}",${q.question_type},${q.required},${q.order_index}`);
        }
      }
      fileContent = rows.join('\n');
    } else if (fileType === 'txt') {
      fileExt = 'txt';
      fileContent = JSON.stringify(surveys, null, 2);
    } else {
      fileExt = 'json';
      fileContent = JSON.stringify(surveys, null, 2);
    }
    const fileName = `survey_data_${Date.now()}.${fileExt}`;
    const filePath = path.join(__dirname, '../../downloads', fileName);
    fs.writeFileSync(filePath, fileContent);
    res.download(filePath, fileName, err => {
      if (err) {
        res.status(500).json({ error: 'File download failed' });
      } else {
        // Optionally delete file after download
        setTimeout(() => { try { fs.unlinkSync(filePath); } catch {} }, 10000);
      }
    });
  } catch (e) {
    console.error('[ADMIN ENDPOINT] Token verification failed:', e);
    return res.status(401).json({ error: 'Invalid token: ' + (e instanceof Error ? e.message : String(e)) });
  }
};

// Get all submissions for the current user
export const getUserSubmissions = async (req: Request, res: Response) => {
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
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;
    const submissions = await getSurveySubmissionByUser(userId);
    return res.json({ submissions });
  } catch (err) {
    console.error('getUserSubmissions: Invalid token error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Delete a submission for the current user
export const deleteUserSubmission = async (req: Request, res: Response) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;
    const submissionId = parseInt(req.params.submissionId);
    // Check that submission belongs to user
    const submissions = await getSurveySubmissionByUser(userId);
    if (!submissions.some((s: any) => s.id === submissionId)) {
      return res.status(403).json({ error: 'Not authorized to delete this submission' });
    }
    await deleteSurveySubmission(submissionId);
    return res.json({ message: 'Submission deleted' });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
import { Request, Response } from 'express';
import { surveyService, createSurveyWithQuestions } from '../services/surveyService';

interface AuthenticatedRequest extends Request {
  user?: { userId: string, id: number };
  body: any;
  params: any;
}

// Survey management endpoints
export const getSurveys = async (req: Request, res: Response) => {
  try {
    const surveys = await surveyService.getAllSurveys();
    res.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSurvey = async (req: Request, res: Response) => {
  try {
    const surveyId = parseInt(req.params.id);
    console.log(`Getting survey with ID: ${surveyId}`);
    
    if (isNaN(surveyId)) {
      return res.status(400).json({ error: 'Invalid survey ID' });
    }
    
    const survey = await surveyService.getSurveyWithQuestions(surveyId);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    console.log(`Found survey: ${survey.title} with ${survey.questions.length} questions`);
    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createSurvey = async (req: Request, res: Response) => {
  try {
    const { title, description, questions } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Survey title is required' });
    }
    // Create the survey first
  const survey = await createSurveyWithQuestions(title, description, questions);
    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Question management endpoints
export const addQuestionToSurvey = async (req: Request, res: Response) => {
  try {
    const surveyId = parseInt(req.params.id);
    const { title, description, questionType, options, required } = req.body;
    
    if (!title || !questionType) {
      return res.status(400).json({ error: 'Question title and type are required' });
    }
    
    const question = await surveyService.addQuestionToSurvey(
      surveyId,
      title,
      questionType,
      description,
      options,
      required
    );
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Response submission endpoints
export const submitSurveyResponse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const surveyId = parseInt(req.params.id);
    const { responses } = req.body;
    
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'Responses are required and must be an array' });
    }
    
    // Validate response format
    for (const response of responses) {
      if (!response.questionId || response.answer === undefined) {
        return res.status(400).json({ 
          error: 'Each response must have questionId and answer' 
        });
      }
    }
    
    console.log('Request body user:', req.body.user);
    let userId = req.user ? req.user.id : undefined;
    // If not authenticated, try to get userId from request body
    if (!userId && req.body.user && req.body.user.id) {
      userId = req.body.user.id;
    }
    const result = await surveyService.submitSurveyResponse(surveyId, responses, userId);
    
    res.status(201).json({
      message: 'Survey response submitted successfully',
      sessionId: result.sessionId,
      submissionId: result.submissionId
    });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSurveySubmission = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const submission = await surveyService.getSurveySubmission(sessionId);
    
    if (!submission) {
      return res.status(404).json({ error: 'Survey submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching survey submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Utility endpoint to create sample survey
export const createSampleSurvey = async (req: Request, res: Response) => {
  try {
    console.log('Creating sample survey...');
    const survey = await surveyService.createSampleSurvey();
    console.log(`Sample survey created with ID: ${survey.id}`);
    res.status(201).json({
      message: 'Sample survey created successfully',
      survey
    });
  } catch (error) {
    console.error('Error creating sample survey:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all submissions for a user by username
import { getSurveySubmissionByUsername } from '../models/surveyModel';
export const getUserSubmissionsByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    const submissions = await getSurveySubmissionByUsername(username);
    return res.json({ submissions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch submissions by username' });
  }
};
