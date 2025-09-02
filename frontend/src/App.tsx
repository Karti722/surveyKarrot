
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SurveyPage from './pages/SurveyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThankYouPage from './pages/ThankYouPage';
import DashboardPage from './pages/DashboardPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import Navbar from './components/Navbar';
import SeeAllSubmissionsPage from './pages/SeeAllSubmissionsPage';
import CreateSurveyPage from './pages/CreateSurveyPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/survey/:surveyId" element={<SurveyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/:username-survey-submissions" element={<DashboardPage />} />
        <Route path="/:username-survey-submissions/:submissionId" element={<SubmissionDetailPage />} />
        <Route path="/seeAllSubmissions" element={<SeeAllSubmissionsPage />} />
        <Route path="/createSurvey" element={<CreateSurveyPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
