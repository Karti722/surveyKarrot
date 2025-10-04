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
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};
// Admin: Get all survey submissions
export const getAllSurveySubmissions = async (req: Request, res: Response) => {
  let token = undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated: No token provided in header or cookie.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.role) {
      return res.status(401).json({ error: 'Invalid token: No role in token.' });
    }
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    const submissions = await surveyService.getAllSurveySubmissions();
    res.json(submissions);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token: ' + (e instanceof Error ? e.message : String(e)) });
  }
};

// Admin-only: Download all survey data as JSON, CSV, or TXT
export const downloadAllSurveyData = async (req: Request, res: Response) => {
  let token = undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated: No token provided in header or cookie.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.role) {
      return res.status(401).json({ error: 'Invalid token: No role in token.' });
    }
    if (decoded.role !== 'admin') {
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
    
    // Send file directly as response (works in serverless environments)
    let contentType = 'application/json';
    if (fileType === 'csv') {
      contentType = 'text/csv';
    } else if (fileType === 'txt') {
      contentType = 'text/plain';
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', contentType);
    res.send(fileContent);
  } catch (e) {
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
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;
    const submissions = await getSurveySubmissionByUser(userId);
    return res.json({ submissions });
  } catch (err) {
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
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
};

export const getSurvey = async (req: Request, res: Response) => {
  try {
    const surveyId = parseInt(req.params.id);
    
    if (isNaN(surveyId)) {
      return res.status(400).json({ error: 'Invalid survey ID' });
    }
    
    const survey = await surveyService.getSurveyWithQuestions(surveyId);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json(survey);
  } catch (error) {
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
    res.status(500).json({ error: 'Failed to create survey' });
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
    res.status(500).json({ error: 'Failed to add question' });
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
    
    const { answers, user } = req.body;
    
    // Generate a unique session ID
    let userId = req.user ? req.user.id : undefined;
    // If not authenticated, try to get userId from request body
    if (!userId && req.body.user && req.body.user.id) {
      userId = req.body.user.id;
    }
    const result = await surveyService.submitSurveyResponse(surveyId, responses, userId);
    
    res.json({ message: 'Survey response submitted successfully', sessionId: result.sessionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit survey response' });
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Utility endpoint to create sample survey
export const createSampleSurvey = async (req: Request, res: Response) => {
  try {
    const survey = await surveyService.createSampleSurvey();
    res.status(201).json({
      message: 'Sample survey created successfully',
      survey
    });
  } catch (error) {
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
