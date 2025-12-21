
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SplashScreen, LoginScreen } from './screens/Auth';
import ChatScreen from './screens/Chat/ChatScreen';
import { DashboardScreen } from './screens/Dashboard';
import { PatientsScreen, PatientProfileScreen } from './screens/Patients';
import { AppointmentsScreen } from './screens/Appointments';
import { ProfileScreen } from './screens/Profile';
import { MenuScreen } from './screens/Menu';
import { InquiryScreen } from './screens/Inquiry';
import { RegistrationScreen, NewRegistrationScreen } from './screens/Registration';
import { AttendanceScreen } from './screens/Attendance';
import { BillingScreen } from './screens/Billing';
import { TestsScreen, CreateTestScreen } from './screens/Tests';
import { ReportsScreen } from './screens/Reports';
import { ExpensesScreen } from './screens/Expenses/ExpensesScreen';
import { SupportScreen } from './screens/Support/SupportScreen';
import { AboutScreen } from './screens/About/AboutScreen';
import { FeedbackScreen } from './screens/Feedback/FeedbackScreen';
import { AppLayout } from './components/Layout';
import ComingSoon from './components/ComingSoon';
import { useAuthStore } from './store/useAuthStore';

// Helper component to handle dynamic titles
const ComingSoonWrapper = () => {
    const location = useLocation();
    const title = (location.state as any)?.title || 'Feature';
    return <ComingSoon title={title} />;
};

function App() {
  // Check if we've already shown the splash screen in this session
  const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (showSplash) {
      // Hide splash screen after 3 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasSeenSplash', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginScreen /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/chat/:id" element={<ChatScreen />} />
          <Route path="/patients" element={<PatientsScreen />} />
          <Route path="/patients/:id" element={<PatientProfileScreen />} />
          <Route path="/appointments" element={<AppointmentsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/menu" element={<MenuScreen />} />
          <Route path="/inquiry" element={<InquiryScreen />} />
          <Route path="/registration" element={<RegistrationScreen />} />
          <Route path="/registration/new" element={<NewRegistrationScreen />} />
          <Route path="/attendance" element={<AttendanceScreen />} />
          <Route path="/billing" element={<BillingScreen />} />
          <Route path="/tests" element={<TestsScreen />} />
          <Route path="/tests/new" element={<CreateTestScreen />} />
          <Route path="/reports" element={<ReportsScreen />} /> 
          <Route path="/expenses" element={<ExpensesScreen />} />
          <Route path="/support" element={<SupportScreen />} />
          <Route path="/about" element={<AboutScreen />} />
          <Route path="/feedback" element={<FeedbackScreen />} />
          <Route path="/menu-placeholder" element={<ComingSoonWrapper />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
