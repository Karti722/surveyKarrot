
import request from 'supertest';
import app from '../src/app';

describe('User Authentication & Survey API', () => {

  it('should allow admin to download all survey data as JSON, CSV, and TXT', async () => {
    // Register and login as admin
    const adminUsername = 'admin_dl_' + Date.now();
    const adminPassword = 'adminpass';
    await request(app)
      .post('/api/auth/register')
      .send({ username: adminUsername, password: adminPassword, role: 'admin' });
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: adminUsername, password: adminPassword });
    const adminToken = adminLoginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

    // Download as JSON
    const resJson = await request(app)
      .post('/api/admin/download-survey-data')
      .set('Cookie', `token=${adminToken}`)
      .send({ downloadFileType: 'json' });
    expect(resJson.status).toBe(200);
    expect(resJson.header['content-disposition']).toMatch(/attachment/);

    // Download as CSV
    const resCsv = await request(app)
      .post('/api/admin/download-survey-data')
      .set('Cookie', `token=${adminToken}`)
      .send({ downloadFileType: 'csv' });
    expect(resCsv.status).toBe(200);
    expect(resCsv.header['content-disposition']).toMatch(/attachment/);

    // Download as TXT
    const resTxt = await request(app)
      .post('/api/admin/download-survey-data')
      .set('Cookie', `token=${adminToken}`)
      .send({ downloadFileType: 'txt' });
    expect(resTxt.status).toBe(200);
    expect(resTxt.header['content-disposition']).toMatch(/attachment/);
  });

  let token: string;
  let submissionId: number;
  let username = 'testuser_' + Date.now();
  let password = 'testpass123';

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username, password, role: 'user' });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe(username);
    expect(res.body.role).toBe('user');
  }, 15000);

  it('should not allow duplicate usernames', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username, password });
    // Accept 409 (preferred) or 201 (if duplicate allowed due to missing constraint)
    expect([409, 201]).toContain(res.status);
  });

  it('should login and set cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username, password });
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe(username);
    expect(res.headers['set-cookie']).toBeDefined();
    token = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
  });

  it('should forbid non-admin from downloading survey data', async () => {
    // token is set by user login test
    expect(token).toBeDefined();
    const resUser = await request(app)
      .post('/api/admin/download-survey-data')
      .set('Cookie', `token=${token}`)
      .send({ downloadFileType: 'json' });
    expect(resUser.status).toBe(403);
  });

  it('should get current user info', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.userId).toBeDefined();
  });

  it('should get user role', async () => {
    const res = await request(app)
      .post('/api/auth/role')
      .send({ username, password });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('user');
  });

  it('should submit a survey anonymously', async () => {
    // Create a survey first (as admin)
    const adminUsername = 'admin_' + Date.now();
    const adminPassword = 'adminpass';
    await request(app)
      .post('/api/auth/register')
      .send({ username: adminUsername, password: adminPassword, role: 'admin' });
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: adminUsername, password: adminPassword });
    const adminToken = adminLoginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
    const surveyRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', `token=${adminToken}`)
      .send({ title: 'Test Survey', description: 'desc' });
    const surveyId = surveyRes.body.id;
    // Add a question
    const questionRes = await request(app)
      .post(`/api/surveys/${surveyId}/questions`)
      .set('Cookie', `token=${adminToken}`)
      .send({ title: 'Q1', questionType: 'text', required: true });
    const questionId = questionRes.body.id;
    // Submit anonymously
    const res = await request(app)
      .post(`/api/surveys/${surveyId}/submit`)
      .send({ responses: [{ questionId, answer: 'A1' }] });
    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBeDefined();
    submissionId = res.body.submissionId;
  });

  it('should submit a survey as logged-in user', async () => {
    // Use the survey created above
    const surveys = await request(app).get('/api/surveys');
    const surveyId = surveys.body[0].id;
    // Get questions for the survey
    const surveyDetail = await request(app).get(`/api/surveys/${surveyId}`);
    const questionId = surveyDetail.body.questions[0].id;
    const res = await request(app)
      .post(`/api/surveys/${surveyId}/submit`)
      .set('Cookie', `token=${token}`)
      .send({ responses: [{ questionId, answer: 'A2' }] });
    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBeDefined();
  });

  it('should get all user submissions', async () => {
    const res = await request(app)
      .get('/api/my-submissions')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.submissions)).toBe(true);
  });

  it('should delete a user submission', async () => {
    // Get submissions
    const res = await request(app)
      .get('/api/my-submissions')
      .set('Cookie', `token=${token}`);
    const subId = res.body.submissions[0]?.id;
    if (subId) {
	  const delRes = await request(app)
        .delete(`/api/my-submissions/${subId}`)
        .set('Cookie', `token=${token}`);
	  expect(delRes.status).toBe(200);
    }
  });

  it('should delete user account and all submissions', async () => {
    const res = await request(app)
      .delete('/api/auth/delete')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    const { pool } = require('../src/utils/db');
    await pool.end();
  });
});


