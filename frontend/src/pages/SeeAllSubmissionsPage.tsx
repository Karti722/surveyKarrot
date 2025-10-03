
import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';


const SeeAllSubmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[ADMIN PAGE] Using token:', token);
    } else {
      console.warn('[ADMIN PAGE] No token found in localStorage.');
    }
    fetch(`${API_BASE}/admin/all-submissions`, {
      credentials: 'include',
      headers
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch all submissions');
        return res.json();
      })
      .then(data => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch all submissions');
        setLoading(false);
      });
  }, []);

  const handleDownload = async (fileType: string) => {
    const token = localStorage.getItem('token');
    console.log('[DOWNLOAD] Token from localStorage:', token);
    console.log('[DOWNLOAD] Current user:', user);
    console.log('[DOWNLOAD] User role:', user?.role);
    
    if (!token) {
      alert('No authentication token found. Please log in again.');
      return;
    }
    
    if (user?.role !== 'admin') {
      alert('You must be an admin to download survey data.');
      return;
    }
    
    const res = await fetch(`${API_BASE}/admin/download-survey-data`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ downloadFileType: fileType })
    });
    
    console.log('[DOWNLOAD] Response status:', res.status);
    console.log('[DOWNLOAD] Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[DOWNLOAD] Error response:', errorText);
      return alert(`Download failed: ${res.status} - ${errorText}`);
    }
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_data.${fileType}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Download all data currently being viewed (JSON)
  const handleDownloadAllData = () => {
    const dataStr = JSON.stringify(submissions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_submissions.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">All Survey Submissions</h2>
  <div className="mt-8 pt-4 mb-4 flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleDownloadAllData}
          className="bg-green-700 hover:bg-green-800 text-green-300 font-extrabold text-lg px-8 py-3 rounded shadow-md transition-colors duration-150"
        >
          Download All Data (JSON)
        </button>
        <button
          onClick={() => handleDownload('csv')}
          className="bg-blue-800 hover:bg-blue-900 text-green-300 font-extrabold text-lg px-8 py-3 rounded shadow-md transition-colors duration-150"
        >
          Download CSV
        </button>
        <button
          onClick={() => handleDownload('txt')}
          className="bg-gray-800 hover:bg-gray-900 text-green-300 font-extrabold text-lg px-20 py-3 rounded shadow-md transition-colors duration-150"
        >
          Download TXT
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto w-full max-w-4xl">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-2">Submission ID</th>
                  <th className="border px-2">Survey Title</th>
                  <th className="border px-2">User ID</th>
                  <th className="border px-2">Submitted At</th>
                  <th className="border px-2">Responses</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub: any) => (
                  <tr key={sub.id}>
                    <td className="border px-2">{sub.id}</td>
                    <td className="border px-2">{sub.survey_title}</td>
                    <td className="border px-2">{sub.user_id}</td>
                    <td className="border px-2">{new Date(sub.submitted_at).toLocaleString()}</td>
                    <td className="border px-2">
                      {Array.isArray(sub.responses) && sub.responses.map((r: any, idx: number) => (
                        <div key={idx}>Q{r.question_id}: {r.answer}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* CSV button moved to top */}
        </>
      )}
    </div>
  );
};

export default SeeAllSubmissionsPage;
