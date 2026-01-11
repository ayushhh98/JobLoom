import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecruiterRegister from './pages/RecruiterRegister';
import RecruiterSuccess from './pages/RecruiterSuccess';

import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import DashboardSeeker from './pages/DashboardSeeker';
import DashboardEmployer from './pages/DashboardEmployer';
import CertificateVerification from './pages/CertificateVerification';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import { AuthProvider } from './context/AuthContext';

import PostJob from './pages/PostJob';
import VerifyEmail from './pages/VerifyEmail';
import About from './pages/About';
import Network from './pages/Network';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactUs from './pages/ContactUs';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="job-details/:id" element={<JobDetails />} />
                <Route path="post-job" element={<PostJob />} />
                <Route path="edit-job/:id" element={<PostJob />} />
                <Route path="dashboard-seeker" element={<DashboardSeeker />} />
                <Route path="dashboard-employer" element={<DashboardEmployer />} />
                <Route path="admin-dashboard" element={<AdminDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="applications" element={<Applications />} />

                <Route path="about" element={<About />} />
                <Route path="network" element={<Network />} />
                <Route path="verify-certificate" element={<CertificateVerification />} />
                <Route path="help" element={<HelpCenter />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="contact" element={<ContactUs />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/recruiter-register" element={<RecruiterRegister />} />
              <Route path="/recruiter-success" element={<RecruiterSuccess />} />
            </Routes>
          </Router>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
