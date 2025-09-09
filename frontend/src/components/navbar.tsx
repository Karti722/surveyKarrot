import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    alert('Logged out successfully!');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/how-to-use" title="How to Use" className="text-xl px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          ?
        </Link>
        <Link to="/" className="text-xl font-bold text-blue-700">SurveyKarrot</Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          user.role === 'admin' ? (
            <>
              <span className="text-gray-700">Hello, <b>{user.username}</b></span>
              <div className="relative group">
                <button className="text-blue-600 font-semibold px-4 py-2 rounded bg-gray-100">Admin Menu ▼</button>
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Link to={`/${user.username}-survey-submissions`} className="block px-4 py-2 hover:bg-gray-100">My Submissions</Link>
                  <Link to="/seeAllSubmissions" className="block px-4 py-2 hover:bg-gray-100">See All Submissions</Link>
                  <Link to="/createSurvey" className="block px-4 py-2 hover:bg-gray-100">Create Survey</Link>
                </div>
              </div>
              <button onClick={handleLogout} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Logout</button>
            </>
          ) : (
            <>
              <span className="text-gray-700">Hello, <b>{user.username}</b></span>
              <Link to={`/${user.username}-survey-submissions`} className="text-blue-600 hover:underline">My Submissions</Link>
              <button onClick={handleLogout} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Logout</button>
            </>
          )
        ) : (
          <>
            <span className="text-gray-500">Guest</span>
            <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;