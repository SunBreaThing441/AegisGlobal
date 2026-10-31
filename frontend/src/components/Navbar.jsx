import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, User, Wallet, Bell,
  Sun, Moon, Calendar, Search, Shield, LayoutDashboard,
  Zap, Crown, Settings, Heart, FileText, ChevronDown,
  Siren, Globe2, Radio, CheckCircle, ShieldAlert,
} from 'lucide-react';
import Badge from './ui/Badge';

export const Navbar = () => {
  const {
    user,
    role,
    isDoctor,
    isAdmin,
    isPatient,
    isPremium,
    isEmergencyActive,
    toggleEmergencyActive,
    socketConnected,
    emergencyAlerts,
    dismissEmergencyAlert,
    theme,
    toggleTheme,
    unreadCount,
    logout,
  } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = user
    ? isDoctor
      ? [
          { to: '/dashboard', label: 'Doctor Queue', icon: LayoutDashboard },
          { to: '/my-appointments', label: 'Consultations', icon: Calendar },
          { to: '/wallet', label: 'Earnings', icon: Wallet },
        ]
      : isAdmin
      ? [
          { to: '/dashboard', label: 'Command Center', icon: Shield },
          { to: '/my-appointments', label: 'All Consultations', icon: Calendar },
          { to: '/wallet', label: 'Ledger Audit', icon: Wallet },
        ]
      : [
          { to: '/dashboard', label: 'Care Portal', icon: LayoutDashboard },
          { to: '/doctors', label: 'Find Specialists', icon: Search },
          { to: '/my-appointments', label: 'Appointments', icon: Calendar },
          { to: '/wallet', label: 'Aegis Wallet', icon: Wallet },
        ]
    : [
        { to: '/doctors', label: 'Find Specialists', icon: Search },
        { to: '/departments', label: 'Departments', icon: Heart },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      {/* 1. UNESCO Global Emergency Alert Banner */}
      <AnimatePresence>
        {emergencyAlerts && emergencyAlerts.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-glow-emergency"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-3 w-full">
              <Siren className="h-4 w-4 animate-bounce shrink-0" />
              <div className="flex-1 truncate">
                <span className="font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded mr-2">
                  UNESCO SOS ALERT
                </span>
                <span>
                  Immediate consultation dispatch active for{' '}
                  <strong>{emergencyAlerts[0]?.patientName || 'Emergency Patient'}</strong>. SLA countdown in progress.
                </span>
              </div>
              <Link
                to="/my-appointments"
                className="bg-white text-red-600 px-3 py-1 rounded-lg font-bold hover:bg-white/90 shrink-0 transition-colors"
              >
                Respond Now
              </Link>
              <button
                onClick={() => dismissEmergencyAlert(emergencyAlerts[0]?.appointmentId)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Navigation Bar */}
      <nav
        className={`transition-all duration-300 border-b ${
          scrolled ? 'glass-nav shadow-lg' : 'bg-[var(--glass-bg)] border-[var(--border-subtle)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[var(--nav-height)]">
            {/* Logo */}
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group shrink-0">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-azure">
                  <Globe2 className="h-5 w-5 text-white animate-spin-slow" />
                </div>
              </motion.div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-display font-black tracking-tight text-[var(--text-primary)]">
                    Aegis<span className="gradient-text-primary">Global</span>
                  </span>
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--accent-cyan)] -mt-0.5">
                  UNESCO Horizon Care
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive(link.to)
                        ? 'text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 shadow-inner-glow'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {isActive(link.to) && (
                      <motion.div
                        layoutId="nav-glow-indicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-[#0077D4] to-[#00F0FF] rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Section: Telemetry, Doctor SOS Toggle, Theme & Profile */}
            <div className="flex items-center gap-3">
              {/* Telemetry Status Beacon */}
              <div
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)]"
                title={socketConnected ? 'Realtime WebSocket Gateway: Active' : 'Connecting to Gateway...'}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="truncate">
                  {socketConnected ? 'Gateway Online' : 'Connecting'}
                </span>
              </div>

              {/* Doctor Emergency Availability Switch */}
              {isDoctor && (
                <button
                  onClick={() => toggleEmergencyActive(!isEmergencyActive)}
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${
                    isEmergencyActive
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-glow-emergency'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-rose-500/30'
                  }`}
                  title="Toggle your availability for 10-minute Emergency SOS calls"
                >
                  <Siren className={`h-3.5 w-3.5 ${isEmergencyActive ? 'animate-pulse text-rose-500' : ''}`} />
                  <span>{isEmergencyActive ? 'SOS: ACTIVE' : 'SOS: STANDBY'}</span>
                </button>
              )}

              {/* Live Notification Bell with Dynamic Counter */}
              {user && (
                <Link
                  to="/dashboard"
                  className="relative p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/40 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center"
                  aria-label="View notifications"
                  title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No unread notifications'}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-glow-emergency animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Accessible Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/40 transition-colors text-[var(--text-secondary)] flex items-center justify-center"
                aria-label="Toggle theme mode"
                title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
              >
                {theme === 'premium' ? (
                  <Crown className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                ) : theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-[var(--accent-cyan)]" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
              </motion.button>

              {/* User Profile or Auth Trigger */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border transition-all ${
                      profileOpen
                        ? 'bg-[var(--bg-tertiary)] border-[var(--accent-cyan)]/40 shadow-glow-cyan'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-primary)]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md ${
                        isAdmin
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                          : isDoctor
                          ? 'bg-gradient-to-br from-[#0077D4] to-[#00F0FF]'
                          : isPremium
                          ? 'bg-gradient-to-br from-amber-500 to-yellow-600'
                          : 'bg-gradient-to-br from-cyan-600 to-blue-700'
                      }`}
                    >
                      {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="hidden lg:block text-left pr-1">
                      <p className="text-xs font-bold text-[var(--text-primary)] leading-tight truncate max-w-[110px]">
                        {isDoctor ? 'Dr. ' : ''}
                        {user.fullName?.split(' ')[0]}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-3 w-3 text-[var(--text-muted)] transition-transform duration-200 ${
                        profileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-72 glass-panel rounded-2xl p-3 border border-[var(--border-primary)] shadow-2xl z-[120]"
                      >
                        {/* User Card */}
                        <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-subtle)] mb-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge type={user.role} size="sm" />
                            {isPremium && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                Horizon Elite
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {isDoctor ? 'Dr. ' : ''}
                              {user.fullName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                          </div>
                          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Wallet Balance:</span>
                            <span className="font-bold text-[var(--accent-cyan)]">
                              ₹{(user.wallet_balance || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Navigation Options */}
                        <div className="space-y-1">
                          <DropdownLink to="/dashboard" icon={LayoutDashboard} label="Command Dashboard" />
                          <DropdownLink to="/profile" icon={User} label="Medical / Profile Dossier" />
                          <DropdownLink
                            to="/wallet"
                            icon={Wallet}
                            label={isDoctor ? 'Earnings Ledger' : 'Aegis Health Wallet'}
                          />
                          <DropdownLink to="/activity" icon={FileText} label="Cryptographic Activity Log" />
                          {isPremium && (
                            <DropdownLink to="/premium-perks" icon={Crown} label="UNESCO Diplomatic Perks" />
                          )}
                        </div>

                        <div className="border-t border-[var(--border-subtle)] my-2" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out of Network
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-azure hover:shadow-lg transition-all"
                  >
                    Deploy Aegis ID
                  </Link>
                </div>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-panel border-b border-[var(--border-primary)] px-4 py-4 space-y-3"
            >
              {isDoctor && (
                <button
                  onClick={() => toggleEmergencyActive(!isEmergencyActive)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold ${
                    isEmergencyActive
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Siren className="h-4 w-4 text-rose-500" />
                    Emergency SOS Availability
                  </span>
                  <span>{isEmergencyActive ? 'ONLINE' : 'STANDBY'}</span>
                </button>
              )}

              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                        isActive(link.to)
                          ? 'text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {!user && (
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl border border-[var(--border-primary)] text-sm font-bold text-[var(--text-primary)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2.5 rounded-xl gradient-primary text-white text-sm font-bold shadow-glow-azure"
                  >
                    Deploy Aegis ID
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

const DropdownLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
  >
    <Icon className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
    <span>{label}</span>
  </Link>
);

export default Navbar;
