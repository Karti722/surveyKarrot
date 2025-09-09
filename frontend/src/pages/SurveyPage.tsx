import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';
import { useAuth } from '../hooks/useAuth';
import { submitSurveyResponse } from '../api';
import type { Survey } from '../contexts/SurveyContext';

const SurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  // Always fetch latest survey details directly from backend
  const { user } = useAuth();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // answers: questionId -> string (for text, textarea, select, radio)
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);

  useEffect(() => {
    if (!surveyId) return;
    setLoading(true);
    fetch(`${API_BASE}/surveys/${surveyId}`)
      .then(res => {
        if (!res.ok) throw new Error('Survey not found');
        return res.json();
      })
      .then(s => {
        // Map backend question fields to frontend expected fields
        const mappedSurvey = {
          ...s,
          questions: Array.isArray(s.questions)
            ? s.questions.map((q: any) => ({
                ...q,
                text: q.text || q.title || '',
                type: q.type || q.question_type || 'text',
              }))
            : [],
        };
        setSurvey(mappedSurvey);
        setLoading(false);
      })
      .catch(() => {
        setError('Survey not found');
        setLoading(false);
      });
  }, [surveyId]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading survey...</div>;
  if (error || !survey) return <div className="flex justify-center items-center min-h-screen text-red-600">{error || 'Survey not found.'}</div>;

  const questions = survey?.questions ?? [];
  const currentQuestion = questions[step];

  const isLast = step === questions.length - 1;

  // Defensive: If no questions, show message
  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">{survey.title}</h2>
        <div className="bg-white shadow rounded p-6 w-full max-w-lg text-center">
          <p className="text-red-600">This survey has no questions.</p>
        </div>
      </div>
    );
  }
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">{survey.title}</h2>
        <div className="bg-white shadow rounded p-6 w-full max-w-lg text-center">
          <p className="text-red-600">No more questions available.</p>
        </div>
      </div>
    );
  }


  // Handles all single-value input types (text, number, email, tel, textarea, select, radio)
  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handles checkbox (multi-select)
  const handleCheckboxChange = (questionId: string, option: string) => {
    setAnswers((prev: any) => {
      const prevArr = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      if (prevArr.includes(option)) {
        // Remove option
        return {
          ...prev,
          [questionId]: prevArr.filter((o: string) => o !== option),
        };
      } else {
        // Add option
        return {
          ...prev,
          [questionId]: [...prevArr, option],
        };
      }
    });
  };

  const handleNext = () => {
    if (isLast) {
      setShowEndOptions(true);
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleAnonymousSubmit = async () => {
    setSubmitting(true);
    try {
      // Convert answers object to array of { questionId, answer }
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer
      }));
      await submitSurveyResponse(survey.id, { responses });
      navigate('/thank-you');
    } catch {
      alert('Failed to submit survey.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSubmit = async () => {
    setSubmitting(true);
    try {
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer
      }));
      console.log('Submitting survey with user:', user);
      await submitSurveyResponse(survey.id, { responses, user });
      navigate(`/${user?.username}-survey-submissions`);
    } catch {
      alert('Failed to submit survey.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg rounded-xl p-6 w-full max-w-lg">
        {!showEndOptions ? (
          <>
            <div className="mb-4">
              <h2 className="survey-question text-lg font-semibold mb-2">{currentQuestion.text}</h2>
              <div className="flex flex-col gap-4 mt-4">
                {/* Render input based on question type */}
                {(() => {
                  const options = Array.isArray(currentQuestion.options) ? currentQuestion.options : [];
                  switch (currentQuestion.type) {
                    case "text":
                    case "number":
                    case "email":
                    case "tel":
                      return (
                        <input
                          type={currentQuestion.type}
                          className="input bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded px-3 py-2 focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] transition"
                          value={answers[currentQuestion.id] || ""}
                          onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                        />
                      );
                    case "textarea":
                      return (
                        <textarea
                          className="input bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded px-3 py-2 focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] transition"
                          value={answers[currentQuestion.id] || ""}
                          onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                        />
                      );
                    case "select":
                      return options.length > 0 ? (
                        <select
                          className="input bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded px-3 py-2 focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] transition"
                          value={answers[currentQuestion.id] || ""}
                          onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                        >
                          <option value="">Select an option</option>
                          {options.map((option: string, idx: number) => (
                            <option key={idx} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-red-500">No options available for this question.</div>
                      );
                    case "radio":
                      return options.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {options.map((option: string, idx: number) => (
                            <label key={idx} className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`question_${currentQuestion.id}`}
                                value={option}
                                checked={answers[currentQuestion.id] === option}
                                onChange={() => handleInputChange(currentQuestion.id, option)}
                                className="accent-[var(--color-primary)] mr-2"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-red-500">No options available for this question.</div>
                      );
                    case "checkbox":
                      return options.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {options.map((option: string, idx: number) => (
                            <label key={idx} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                name={`question_${currentQuestion.id}`}
                                value={option}
                                checked={Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option)}
                                onChange={() => handleCheckboxChange(currentQuestion.id, option)}
                                className="accent-[var(--color-primary)] mr-2"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-red-500">No options available for this question.</div>
                      );
                    default:
                      return <div>Unsupported question type</div>;
                  }
                })()}
              </div>
            </div>
            <div className="flex justify-between mt-6 gap-4">
              <button
                className={`survey-btn px-6 py-2 rounded-lg font-semibold shadow-sm border transition ${step === 0 ? 'survey-btn-disabled' : 'survey-btn-nav'}`}
                onClick={handlePrev}
                disabled={step === 0}
              >
                Previous
              </button>
              <button
                className={`survey-btn px-6 py-2 rounded-lg font-semibold shadow-md border transition ${!answers[currentQuestion.id] ? 'survey-btn-disabled' : 'survey-btn-primary'}`}
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                {isLast ? 'Finish' : 'Next'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-2 mt-8">
            <button
              className={`survey-btn px-6 py-2 rounded-lg font-semibold shadow-md border transition ${submitting ? 'survey-btn-disabled' : 'survey-btn-primary'}`}
              onClick={user ? handleUserSubmit : handleAnonymousSubmit}
              disabled={submitting}
            >
              {user ? `Submit as ${user.username}` : 'Submit Anonymously'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyPage;
