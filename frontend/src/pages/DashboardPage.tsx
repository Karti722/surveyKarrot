import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchUserSubmissions } from '../api';
import { Link, useParams } from 'react-router-dom';

interface Submission {
  id: string;
  surveyTitle?: string; // legacy
  createdAt?: string;   // legacy
  survey_title?: string;
  survey_created_at?: string;
}

const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const { username } = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.username) return;
    setLoading(true);
    fetchUserSubmissions(user.username)
      .then(data => {
        console.log('User submissions API response:', data);
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch submissions');
        setLoading(false);
      });
  }, [user?.username]);

  // Group submissions by survey title (prefer new field, fallback to old)
  const grouped = submissions.reduce((acc, sub) => {
    const title = sub.survey_title || sub.surveyTitle || sub.survey_id || 'Untitled Survey';
    acc[title] = acc[title] || [];
    acc[title].push(sub);
    return acc;
  }, {} as Record<string, Submission[]>);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Survey Submissions</h2>
      <div className="w-full max-w-2xl space-y-4">
        {loading && <div>Loading submissions...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && Object.keys(grouped).length === 0 && (
          <div>No submissions found.</div>
        )}
        {!loading && !error && Object.entries(grouped).map(([title, subs]) => (
          <div key={title} className="bg-white shadow rounded p-4 mb-4">
            <span className="font-semibold">{title}</span>
            <div className="mt-2 space-y-2">
              {subs.map(sub => {
                const dateStr = sub.survey_created_at || sub.createdAt;
                return (
                  <Link
                    key={sub.id}
                    to={`/${user.username}-survey-submissions/${sub.id}`}
                    className="block px-4 py-2 bg-blue-200 text-black rounded hover:bg-blue-700"
                  >
                    View Submission ({dateStr ? new Date(dateStr).toLocaleString() : 'No date'})
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
