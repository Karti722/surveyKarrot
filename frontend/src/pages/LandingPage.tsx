import React from 'react';
import { useSurvey } from '../hooks/useSurvey';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { surveys, loading, error, refreshSurveys } = useSurvey();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full">
      <h1 className="survey-title text-4xl mb-4">Welcome to the Survey App</h1>
      <p className="mb-8 text-lg text-text-secondary text-center max-w-xl">Start a survey below. You can login or register at any time to save your results!</p>
      <div className="w-full max-w-md space-y-5">
        {loading && <div className="text-center text-text-secondary">Loading surveys...</div>}
        {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
        {!loading && !error && surveys.length === 0 && (
          <div className="text-center text-text-secondary">No surveys available.</div>
        )}
        {!loading && !error && surveys.map(survey => (
          <div key={survey.id} className="survey-card bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg rounded-xl p-5 flex flex-col items-center transition hover:shadow-2xl">
            <span className="font-semibold text-lg text-accent mb-1">{survey.title}</span>
            <p className="text-text-secondary text-sm mb-3 text-center">{survey.description}</p>
            <Link to={`/survey/${survey.id}`} className="btn mt-2 px-5 py-2 rounded font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition">Start Survey</Link>
          </div>
        ))}
      </div>
      <button className="mt-8 btn bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition" onClick={refreshSurveys}>Refresh Surveys</button>
    </div>
  );
};

export default LandingPage;
