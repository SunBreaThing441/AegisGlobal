import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
  User, Mail, Lock, ArrowRight, Gift, Loader2, Stethoscope,
  Eye, EyeOff, CheckCircle2, XCircle, Activity, ArrowLeft,
  AlertCircle, Shield, CreditCard, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ui/ParticleBackground';
import GradientText from '../components/ui/GradientText';

export const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useContext(AuthContext);

  const [activeRole, setActiveRole] = useState('patient'); // 'patient' | 'doctor'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: 'General Physician',
    consultationFee: 500,
    referralCode: '',
  });

  const [errors, setErrors] = useState({});

  const goHome = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full legal name is required';
    }

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (activeRole === 'doctor') {
      if (!formData.specialization) {
        newErrors.specialization = 'Please select your medical specialization';
      }
      if (formData.consultationFee < 0) {
        newErrors.consultationFee = 'Consultation fee cannot be negative';
      }
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
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: activeRole,
        referralCode: formData.referralCode ? formData.referralCode.trim() : null,
        specialization: activeRole === 'doctor' ? formData.specialization : undefined,
        consultationFee: activeRole === 'doctor' ? Number(formData.consultationFee) : 0,
      };

      await register(payload);
      toast.success(`Aegis ID deployed as ${activeRole.toUpperCase()}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Email may already be registered.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google authentication token missing.');
      return;
    }
    setLoading(true);
    try {
      await googleLogin(credentialResponse, activeRole);
      toast.success(`Account connected via Google as ${activeRole.toUpperCase()}!`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Register Error:', err);
      toast.error(err.response?.data?.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleBackground particleCount={30} color="azure" speed={0.3} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#0077D4]/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-xl w-full"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[var(--border-primary)] shadow-2xl relative">
          {/* Back Button */}
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
                Deploy <GradientText gradient="primary">Aegis ID</GradientText>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Join the UNESCO Horizon Healthcare Registry
              </p>
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-subtle)] mb-6">
            <button
              type="button"
              onClick={() => { setActiveRole('patient'); setErrors({}); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'patient'
                  ? 'bg-[var(--glass-bg)] text-[var(--accent-cyan)] shadow-glow-cyan border border-[var(--border-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Patient Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveRole('doctor'); setErrors({}); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'doctor'
                  ? 'bg-[var(--glass-bg)] text-[var(--accent-cyan)] shadow-glow-cyan border border-[var(--border-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Accredited Specialist</span>
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
                Full Legal Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={activeRole === 'doctor' ? 'Dr. Marcus Brody' : 'Elena Rostova'}
                  className={`glass-input w-full pl-10 pr-4 ${errors.fullName ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-red-400 font-medium">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Official Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@aegisglobal.org"
                  className={`glass-input w-full pl-10 pr-4 ${errors.email ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-400 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Doctor-Specific Inputs */}
            {activeRole === 'doctor' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Medical Specialization
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="glass-input w-full px-3 py-3 text-xs font-semibold"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Base Consultation Fee (₹)
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      min="0"
                      step="50"
                      className="glass-input w-full pl-10 pr-4 text-xs font-semibold"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 chars"
                    className={`glass-input w-full pl-10 pr-9 ${errors.password ? 'border-red-500/50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-400 font-medium">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`glass-input w-full pl-10 pr-9 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-400 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Optional Referral Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                UNESCO Grant / Referral Code <span className="text-[var(--text-muted)] normal-case font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="e.g. AEGIS-PAT01"
                  className="glass-input w-full pl-10 pr-4 text-xs font-mono uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-bold text-sm uppercase tracking-wider shadow-glow-azure hover:opacity-95 transition-opacity flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enrolling into Horizon Network...</span>
                </>
              ) : (
                <>
                  <span>Deploy Account Dossier</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign Up */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Sign Up Failed')}
                theme="outline"
                shape="pill"
                size="large"
                text="signup_with"
                width="340"
              />
            </div>
          </div>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-xs text-[var(--text-muted)]">
            Already have an active Aegis ID?{' '}
            <Link
              to="/login"
              className="font-bold text-[var(--accent-cyan)] hover:underline ml-1"
            >
              Access Terminal
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
