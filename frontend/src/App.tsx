
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SurveyPage from './pages/SurveyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThankYouPage from './pages/ThankYouPage';
import DashboardPage from './pages/DashboardPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import Navbar from './components/navbar';
import SeeAllSubmissionsPage from './pages/SeeAllSubmissionsPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import HowToUsePage from './pages/HowToUsePage';

function App() {
  return (
    <div className="min-h-screen text-gray-900 bg-gray-50">
      <Navbar />
      <main className="pt-2">
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
          <Route path="/how-to-use" element={<HowToUsePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
