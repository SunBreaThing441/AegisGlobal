import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
  Mail, Lock, ArrowRight, Loader2, Activity, Eye, EyeOff,
  ArrowLeft, User, Stethoscope, Shield, AlertCircle, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from '../components/ui/ParticleBackground';
import GradientText from '../components/ui/GradientText';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'doctor' | 'admin'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const goHome = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // Quick Demo Autofill Helper
  const setDemoCredentials = (roleType) => {
    setActiveTab(roleType);
    if (roleType === 'patient') {
      setFormData({ email: 'patient@aegisglobal.org', password: 'Test@123' });
    } else if (roleType === 'doctor') {
      setFormData({ email: 'dr.elena@aegisglobal.org', password: 'Test@123' });
    } else {
      setFormData({ email: 'admin@aegisglobal.org', password: 'Test@123' });
    }
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid institutional or personal email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(formData.email.trim(), formData.password);
      toast.success(`Welcome back, ${res.user?.fullName || 'Member'}!`);

      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google OAuth credential was not received.');
      return;
    }
    setLoading(true);
    try {
      await googleLogin(credentialResponse, activeTab);
      toast.success('Google Authentication Successful!');
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Google Login Error:', err);
      toast.error(err.response?.data?.message || 'Google Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleBackground particleCount={30} color="cyan" speed={0.3} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#0077D4]/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[var(--border-primary)] shadow-2xl relative">
          {/* Back Link */}
          <button
            onClick={goHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Return to Horizon Portal
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-azure">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-[var(--text-primary)] leading-tight">
                Sign in to <GradientText gradient="primary">AegisGlobal</GradientText>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                UNESCO Horizon Universal Telehealth Terminal
              </p>
            </div>
          </div>

          {/* Tabbed Role Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-subtle)] mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('patient'); setErrors({}); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'patient'
                  ? 'bg-[var(--glass-bg)] text-[var(--accent-cyan)] shadow-glow-cyan border border-[var(--border-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Patient</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('doctor'); setErrors({}); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'doctor'
                  ? 'bg-[var(--glass-bg)] text-[var(--accent-cyan)] shadow-glow-cyan border border-[var(--border-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Specialist</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setErrors({}); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-[var(--glass-bg)] text-[var(--accent-cyan)] shadow-glow-cyan border border-[var(--border-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Error Banner */}
          {errors.form && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                {activeTab === 'doctor'
                  ? 'Accredited Medical Email'
                  : activeTab === 'admin'
                  ? 'Director Identification Email'
                  : 'Patient Account Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={
                    activeTab === 'doctor'
                      ? 'dr.elena@aegisglobal.org'
                      : activeTab === 'admin'
                      ? 'admin@aegisglobal.org'
                      : 'patient@aegisglobal.org'
                  }
                  className={`glass-input w-full pl-10 pr-4 ${errors.email ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-400 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Cryptographic Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[var(--accent-cyan)] hover:underline font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`glass-input w-full pl-10 pr-10 ${errors.password ? 'border-red-500/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-400 font-medium">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-bold text-sm uppercase tracking-wider shadow-glow-azure hover:opacity-95 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authorizing Terminal...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Bar */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-center text-[var(--text-muted)] flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Quick Demo Autofill Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('patient')}
                className="py-1.5 px-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:border-[var(--accent-cyan)]/40 hover:text-[var(--text-primary)] transition-all"
              >
                👤 Patient
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('doctor')}
                className="py-1.5 px-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:border-[var(--accent-cyan)]/40 hover:text-[var(--text-primary)] transition-all"
              >
                🩺 Doctor
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="py-1.5 px-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:border-[var(--accent-cyan)]/40 hover:text-[var(--text-primary)] transition-all"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Sign In Failed')}
                theme="outline"
                shape="pill"
                size="large"
                text="signin_with"
                width="340"
              />
            </div>
          </div>

          {/* Registration Redirect */}
          <p className="text-center mt-6 text-xs text-[var(--text-muted)]">
            New to the Horizon Network?{' '}
            <Link
              to="/register"
              className="font-bold text-[var(--accent-cyan)] hover:underline ml-1"
            >
              Deploy Aegis ID
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
