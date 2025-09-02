import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If coming from survey, preserve answers and surveyId
  const fromSurvey = location.state?.fromSurvey;
  const surveyId = location.state?.surveyId;
  const answers = location.state?.answers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      alert('Login successful!');
      // Check for pending survey in localStorage
      const pending = localStorage.getItem('pendingSurvey');
      if (pending) {
        const { surveyId, answers } = JSON.parse(pending);
        // Submit as user
        const responses = Object.entries(answers).map(([questionId, answer]) => ({
          questionId: Number(questionId),
          answer
        }));
  const user = JSON.parse(localStorage.getItem('auth') || '{}').user;
  const username = user?.username;
  await import('../api').then(api => api.submitSurveyResponse(surveyId, username ? { responses, username } : { responses }));
        localStorage.removeItem('pendingSurvey');
        navigate('/thank-you');
        return;
      }
      // If coming from survey, go back to survey page and preserve answers
      if (fromSurvey && surveyId) {
        navigate(`/survey/${surveyId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form className="bg-white shadow rounded p-6 w-full max-w-sm" onSubmit={handleSubmit}>
        <input
          className="mb-4 w-full px-3 py-2 border rounded"
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
        />
        <input
          className="mb-4 w-full px-3 py-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        <button
          className="w-full hover:bg-blue-700 hover:text-green-500"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
