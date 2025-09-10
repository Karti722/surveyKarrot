// Fetch submissions by username (public or admin)
export async function fetchUserSubmissionsByUsername(username: string) {
  const res = await fetch(`${API_BASE}/user-submissions/${username}`);
  if (!res.ok) throw new Error('Failed to fetch submissions by username');
  return res.json();
}
// API utility for backend requests
export const API_BASE = 'https://survey-karrot.vercel.app/api'; // Changed from 3000 to 5000

export async function fetchSurveys() {
  const res = await fetch(`${API_BASE}/surveys`);
  if (!res.ok) throw new Error('Failed to fetch surveys');
  return res.json();
}

export async function fetchSurveyById(id: string) {
  const res = await fetch(`${API_BASE}/surveys/${id}`);
  if (!res.ok) throw new Error('Failed to fetch survey');
  return res.json();
}

export async function submitSurveyResponse(surveyId: string, answers: any ) {
  const res = await fetch(`${API_BASE}/surveys/${surveyId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(answers),
  });
  if (!res.ok) throw new Error('Failed to submit survey');
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}


// Fetch submissions by username (public or admin)
export async function fetchUserSubmissions(username: string) {
  const res = await fetch(`${API_BASE}/user-submissions/${username}`);
  if (!res.ok) throw new Error('Failed to fetch submissions by username');
  return res.json();
}
