import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';


const CreateSurveyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [options, setOptions] = useState('');
  const [required, setRequired] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: questionText,
        question_type: questionType,
        options:
          questionType === 'select' || questionType === 'radio' || questionType === 'checkbox'
            ? options.split(',').map(o => o.trim()).filter(Boolean)
            : undefined,
        required,
        order_index: questions.length + 1
      }
    ]);
    setQuestionText('');
    setQuestionType('text');
    setOptions('');
    setRequired(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description, questions })
      });
      if (!res.ok) throw new Error('Failed to create survey');
      setMessage('Survey created successfully!');
      setTitle('');
      setDescription('');
      setQuestions([]);
    } catch {
      setMessage('Failed to create survey.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Survey</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 w-full max-w-lg">
        <div className="mb-4">
          <label className="block font-semibold mb-1">Survey Title</label>
          <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Add Question</label>
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Question text" value={questionText} onChange={e => setQuestionText(e.target.value)} />
          <select className="w-full border rounded px-3 py-2 mb-2" value={questionType} onChange={e => setQuestionType(e.target.value)}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="tel">Phone</option>
            <option value="textarea">Textarea</option>
            <option value="select">Select</option>
            <option value="radio">Radio</option>
            <option value="checkbox">Checkbox</option>
          </select>
          {(questionType === 'select' || questionType === 'radio' || questionType === 'checkbox') && (
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Comma-separated options" value={options} onChange={e => setOptions(e.target.value)} />
          )}
          <label className="inline-flex items-center mb-2">
            <input type="checkbox" className="mr-2" checked={required} onChange={e => setRequired(e.target.checked)} />
            Required
          </label>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addQuestion}
          >
            Add Question
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Questions Preview</label>
          <ul className="list-disc pl-5">
            {questions.map((q, idx) => (
              <li key={idx}>{q.title} ({q.question_type}) {q.required ? '[Required]' : ''}</li>
            ))}
          </ul>
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={creating}>Create Survey</button>
        {message && <div className="mt-2 text-blue-600">{message}</div>}
      </form>
    </div>
  );
};

export default CreateSurveyPage;
