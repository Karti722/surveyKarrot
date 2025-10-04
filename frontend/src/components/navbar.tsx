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
    <nav className="bg-white shadow-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <Link to="/how-to-use" title="How to Use" className="navbar-link text-xl px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          ?
        </Link>
        <Link to="/" className="navbar-link text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center">
          🥕 SurveyKarrot
        </Link>
        <Link to="/" className="navbar-link text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors">
          🏠 Home
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          user.role === 'admin' ? (
            <>
              <span className="text-gray-700">Hello, <b className="text-blue-700">{user.username}</b></span>
              <div className="relative group">
                <button className="text-white font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">Admin Menu ▼</button>
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <Link to={`/${user.username}-survey-submissions`} className="navbar-link block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-gray-700 hover:text-blue-600">📊 My Submissions</Link>
                  <Link to="/seeAllSubmissions" className="navbar-link block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-gray-700 hover:text-blue-600">👥 See All Submissions</Link>
                  <Link to="/createSurvey" className="navbar-link block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-600">➕ Create Survey</Link>
                </div>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Logout</button>
            </>
          ) : (
            <>
              <span className="text-gray-700">Hello, <b className="text-blue-700">{user.username}</b></span>
              <Link to={`/${user.username}-survey-submissions`} className="navbar-link text-blue-600 hover:text-blue-800 font-medium hover:underline">📊 My Submissions</Link>
              <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Logout</button>
            </>
          )
        ) : (
          <>
            <span className="text-gray-500">👤 Guest</span>
            <Link to="/login" className="navbar-link text-blue-600 hover:text-blue-800 font-medium hover:underline">Login</Link>
            <Link to="/register" className="navbar-link text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;