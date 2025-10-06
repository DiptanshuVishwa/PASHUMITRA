import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/EnhancedLanguageContext'; // Use enhanced version
import { Toaster } from 'react-hot-toast'; // Add this import
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LanguageLoadingModal from './components/LanguageLoadingModal'; // Add this import
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Questionnaire from './pages/Questionnaire';
import WarningPage from './pages/WarningPage';
import CompliancePage from './pages/CompliancePage';
import RiskAssessmentPage from './pages/RiskAssessmentPage';
import RaiseAlertPage from './pages/RaiseAlertPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import FarmManagementPage from './pages/FarmManagementPage';
import WeatherDashboard from './pages/WeatherDashboard';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import GoogleAuthFailure from './pages/GoogleAuthFailure';
import {
  Learning,
  Privacy,
  Settings,
  Feedback,
  ContactVet,
  ContactUs
} from './pages/PlaceholderPages';
import './App.css';

function App() {
  return (
    <LanguageProvider> {/* Use Enhanced Language Provider */}
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                <Route path="/auth/google/failure" element={<GoogleAuthFailure />} />
                <Route path="/questionnaire" element={<Questionnaire />} />
                <Route path="/warning" element={<WarningPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/compliance" element={<CompliancePage />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
                <Route path="/raise-alert" element={<RaiseAlertPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/farm-management" element={<FarmManagementPage />} />
                <Route path="/weather" element={<WeatherDashboard />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/contact-vet" element={<ContactVet />} />
                <Route path="/contact-us" element={<ContactUs />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Enhanced UX Components */}
            <LanguageLoadingModal />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;