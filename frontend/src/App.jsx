import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Profile from './pages/Profile';
import MyAppointments from './pages/MyAppointments';
import Subscribe from './pages/Subscribe';
import PaymentSuccess from './pages/PaymentSuccess';
import PremiumPerks from './pages/PremiumPerks';
import ForgotPassword from './pages/ForgotPassword';
import Departments from './pages/Departments';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import WalletPage from './pages/Wallet';

// Page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  const location = useLocation();

  // Pages where we hide Navbar and Footer
  const hideChrome = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col transition-colors duration-400">
      {!hideChrome && <Navbar />}

      <main className={`flex-1 ${!hideChrome ? 'pt-[var(--nav-height)]' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/doctors" element={<PageWrapper><Doctors /></PageWrapper>} />
            <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
            <Route path="/departments" element={<PageWrapper><Departments /></PageWrapper>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/activity" element={
              <ProtectedRoute><PageWrapper><ActivityLog /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/my-appointments" element={
              <ProtectedRoute><PageWrapper><MyAppointments /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute><PageWrapper><WalletPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/subscribe" element={
              <ProtectedRoute><PageWrapper><Subscribe /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/payment-success" element={<PageWrapper><PaymentSuccess /></PageWrapper>} />
            <Route path="/premium-perks" element={<PageWrapper><PremiumPerks /></PageWrapper>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideChrome && <ChatBot />}
      {!hideChrome && <Footer />}
    </div>
  );
};

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <AppContent />
    </>
  );
}

export default App;
