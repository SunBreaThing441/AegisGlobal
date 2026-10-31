import { useContext } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Activity, Lock } from 'lucide-react';

/**
 * Strict Client-Side Route Guard for AegisGlobal: UNESCO Horizon Care Network
 * Supports unauthenticated redirects and role-specific clearance policies.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, role } = useContext(AuthContext);
  const location = useLocation();

  // 1. Session Verification Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-6 p-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl border-2 border-[var(--accent-cyan)]/20 animate-ping" />
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-[var(--accent-cyan)] animate-spin" />
          <Activity className="h-6 w-6 text-[var(--accent-cyan)] animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)]">
            AegisGlobal Horizon Protocol
          </h3>
          <p className="text-xs text-[var(--text-muted)] animate-pulse">
            Verifying Biometric & Cryptographic Clearance...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Redirect
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-Based Clearance Guard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full text-center border-red-500/30 p-8 space-y-6"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-glow-emergency">
            <ShieldAlert className="h-8 w-8 text-red-400" />
          </div>

          <div className="space-y-2">
            <span className="unesco-badge unesco-badge-emergency">
              Clearance Level Restricted
            </span>
            <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
              Access Protocol Denied
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              This terminal requires <strong className="text-[var(--text-primary)]">[{allowedRoles.join(' / ').toUpperCase()}]</strong> clearance.
              Your current profile credential is registered as <strong className="text-[var(--accent-cyan)]">[{role.toUpperCase()}]</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold shadow-glow-azure hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Authorized Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 4. Access Granted
  return children;
};

// Shorthand Role Guards
export const DoctorRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['doctor']}>{children}</ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
);

export const PatientRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['patient']}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
