import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
  await register(username, email, password);
  alert('Registration successful!');
      // Check for pending survey in localStorage
      const pending = localStorage.getItem('pendingSurvey');
      if (pending) {
        const { surveyId, answers } = JSON.parse(pending);
        // Submit as user
        const responses = Object.entries(answers).map(([questionId, answer]) => ({
          questionId: Number(questionId),
          answer
        }));
        await import('../api').then(api => api.submitSurveyResponse(surveyId, { responses }));
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
      setError((err as Error).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form className="bg-white shadow rounded p-6 w-full max-w-sm" onSubmit={handleSubmit}>
        <input
          className="mb-4 w-full px-3 py-2 border rounded"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="mb-4 w-full px-3 py-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          className="m-1 w-full hover:text-green-500 px-4 py-2 bg-green-600 text-black rounded hover:bg-green-700 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
