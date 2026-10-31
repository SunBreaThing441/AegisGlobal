import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Users, Calendar, Clock, Activity, Search,
  ArrowUpRight, TrendingUp, Shield, Sparkles, Crown,
  CheckCircle2, AlertCircle, History, MessageSquare, Wallet,
  Video, Zap, X, Check, Bot, Send, Loader2, ChevronRight, AlertTriangle,
  FileText, Pill, Upload, Download, RefreshCw, Stethoscope,
  Award, ShieldAlert, CheckSquare, Eye, RotateCcw, BarChart3,
  Building2, Phone, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import RescheduleModal from '../components/RescheduleModal';
import PrescriptionModal from '../components/PrescriptionModal';
import RecordsModal from '../components/RecordsModal';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import GradientText from '../components/ui/GradientText';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import useCountdown from '../hooks/useCountdown';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.35 } }
};

// ── Emergency SLA Countdown Timer ──────────────────────────────────────────
const EmergencyTimer = ({ timeoutAt, onExpire, isPatient }) => {
  const { minutes, seconds, isExpired, totalSeconds } = useCountdown(timeoutAt);

  useEffect(() => {
    if (isExpired && onExpire) onExpire();
  }, [isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-rose-500">
        <AlertCircle className="h-4 w-4" />
        {isPatient ? '10-Min SLA Expired — Auto-Rerouting Specialist' : 'SLA Window Expired — Penalty Applied'}
      </div>
    );
  }

  return (
    <div
      className={`mt-2 flex items-center gap-2 font-mono font-bold text-xs ${
        totalSeconds < 180 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
      }`}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
      <span className="text-[11px] font-sans font-normal text-[var(--text-muted)]">
        {isPatient ? 'waiting for specialist response' : 'SLA response deadline'}
      </span>
    </div>
  );
};

// ── Decline Reason Modal ───────────────────────────────────────────────────
const DeclineReasonModal = ({ isOpen, isEmergency, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warning('Please enter an official clinical justification.');
      return;
    }
    setSubmitting(true);
    await onConfirm(reason.trim());
    setSubmitting(false);
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEmergency ? 'Decline Emergency Triage' : 'Decline Teleconsultation'}
      subtitle="UNESCO Horizon Care Quality Assurance"
      size="md"
    >
      <div className="space-y-4">
        {isEmergency && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              Under the UNESCO Horizon Accord, declining emergency dispatches requires an official reason and logs an audit record.
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Clinical / Administrative Reason *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isEmergency
                ? 'e.g. Currently performing urgent surgical stabilization, patient requires in-person ICU...'
                : 'e.g. Clinical schedule conflict, requires specialty referral...'
            }
            className="glass-input w-full text-xs resize-none py-2.5 px-3"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold glass border border-[var(--border-subtle)] text-[var(--text-secondary)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white flex items-center justify-center gap-1.5 shadow-glow-emergency disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Confirm Decline
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Admin Penalty Reversal Modal ───────────────────────────────────────────
const PenaltyReverseModal = ({ isOpen, transaction, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warning('Audit justification is required for penalty reversal.');
      return;
    }
    setSubmitting(true);
    await onConfirm(transaction.id, reason.trim());
    setSubmitting(false);
    setReason('');
  };

  if (!isOpen || !transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reverse SLA Penalty"
      subtitle="Directorate Oversight & Discretionary Relief"
      size="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1">
          <p className="font-bold text-cyan-300">Transaction ID: #{transaction.id}</p>
          <p className="text-[var(--text-secondary)]">Amount to refund: ₹{Math.abs(transaction.amount)}</p>
          <p className="text-[var(--text-muted)] text-[11px]">{transaction.description}</p>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Directorate Audit Reason *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Telemetry outage verified, justified technical delay in satellite gateway..."
            className="glass-input w-full text-xs resize-none py-2.5 px-3"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold glass border border-[var(--border-subtle)] text-[var(--text-secondary)]"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold gradient-primary text-white flex items-center justify-center gap-1.5 shadow-glow-cyan disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Confirm Reversal
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ===========================================================================
// MAIN COMPONENT: Dashboard
// ===========================================================================
export const Dashboard = () => {
  const { user, updateUser, socket } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [liveSession, setLiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Doctor state
  const [isEmergencyActive, setIsEmergencyActive] = useState(user?.is_emergency_active || false);
  const [doctorProfile, setDoctorProfile] = useState(null);

  // Patient Document & Prescription Drawer state
  const [selectedUploadApptId, setSelectedUploadApptId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [isPrescriptionDrawerOpen, setIsPrescriptionDrawerOpen] = useState(false);
  const [drawerPrescription, setDrawerPrescription] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Admin state
  const [adminStats, setAdminStats] = useState(null);
  const [doctorMetrics, setDoctorMetrics] = useState([]);
  const [adminPenaltyModal, setAdminPenaltyModal] = useState({ open: false, transaction: null });

  // Modals state
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [prescriptionAppt, setPrescriptionAppt] = useState(null);
  const [recordsAppt, setRecordsAppt] = useState(null);
  const [declineModal, setDeclineModal] = useState({ open: false, apptId: null, isEmergency: false });

  // AI Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Welcome to UNESCO Horizon Care Clinical Triage. I am your certified AI Health Assistant. Describe your symptoms or medical query to begin.`
    }
  ]);
  const chatScrollRef = useRef(null);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const role = user?.role || 'patient';
  const isDoctor = role === 'doctor';
  const isAdmin = role === 'admin';
  const isPatient = role === 'patient';

  // ── Fetch Dashboard Data ─────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      if (isAdmin) {
        // Admin fetch with /api/admin/dashboard & /api/admin/stats fallback
        const [dashRes, metricsRes, statsRes] = await Promise.allSettled([
          axios.get(`${backendUrl}/api/admin/dashboard`, { headers }),
          axios.get(`${backendUrl}/api/admin/doctors/metrics`, { headers }),
          axios.get(`${backendUrl}/api/admin/stats`, { headers })
        ]);

        if (dashRes.status === 'fulfilled') setAdminStats(dashRes.value.data);
        else if (statsRes.status === 'fulfilled') setAdminStats(statsRes.value.data);
        if (metricsRes.status === 'fulfilled') setDoctorMetrics(metricsRes.value.data);
      } else if (isDoctor) {
        // Doctor command center fetch
        const [statsRes, apptsRes, logsRes, activeCallRes, docProfRes] = await Promise.allSettled([
          axios.get(`${backendUrl}/api/users/dashboard-stats`, { headers }),
          axios.get(`${backendUrl}/api/appointments/my-appointments`, { headers }),
          axios.get(`${backendUrl}/api/users/activity-logs`, { headers }),
          axios.get(`${backendUrl}/api/appointments/active-call`, { headers }),
          axios.get(`${backendUrl}/api/doctors/profile`, { headers })
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (apptsRes.status === 'fulfilled') setAppointments(Array.isArray(apptsRes.value.data) ? apptsRes.value.data : []);
        if (logsRes.status === 'fulfilled') setActivities(Array.isArray(logsRes.value.data) ? logsRes.value.data : []);
        if (activeCallRes.status === 'fulfilled') setLiveSession(activeCallRes.value.data);
        if (docProfRes.status === 'fulfilled') setDoctorProfile(docProfRes.value.data);
      } else {
        // Patient dashboard fetch
        const [statsRes, apptsRes, logsRes, activeCallRes] = await Promise.allSettled([
          axios.get(`${backendUrl}/api/users/dashboard-stats`, { headers }),
          axios.get(`${backendUrl}/api/appointments/my-appointments`, { headers }),
          axios.get(`${backendUrl}/api/users/activity-logs`, { headers }),
          axios.get(`${backendUrl}/api/appointments/active-call`, { headers })
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (apptsRes.status === 'fulfilled') {
          const apptList = Array.isArray(apptsRes.value.data) ? apptsRes.value.data : [];
          setAppointments(apptList);
          if (apptList.length > 0 && !selectedUploadApptId) {
            setSelectedUploadApptId(apptList[0].id);
          }
        }
        if (logsRes.status === 'fulfilled') setActivities(Array.isArray(logsRes.value.data) ? logsRes.value.data : []);
        if (activeCallRes.status === 'fulfilled') setLiveSession(activeCallRes.value.data);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [backendUrl, role]);

  // ── Socket.IO Real-Time Listeners ────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleRefresh = (msg) => {
      fetchDashboardData();
      if (msg) toast.info(msg);
    };

    socket.on('appointment:new', () => handleRefresh('New consultation request in Horizon queue!'));
    socket.on('emergency:new', () => handleRefresh('🚨 CRITICAL: Incoming 10-Min SLA Emergency SOS!'));
    socket.on('appointment:status', () => handleRefresh('Appointment status updated.'));
    socket.on('emergency:accepted', () => handleRefresh('Emergency consultation accepted. Video link ready.'));
    socket.on('emergency:expired', () => handleRefresh('Emergency window expired. Rerouting patient.'));
    socket.on('penalty:applied', (data) => handleRefresh(data?.message || '⚠️ Penalty applied for SLA violation.'));

    return () => {
      socket.off('appointment:new');
      socket.off('emergency:new');
      socket.off('appointment:status');
      socket.off('emergency:accepted');
      socket.off('emergency:expired');
      socket.off('penalty:applied');
    };
  }, [socket]);

  // Scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isChatOpen]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (id, status, reason) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        await axios.put(
          `${backendUrl}/api/appointments/status/${id}`,
          { status, reason },
          { headers }
        );
      } catch (err) {
        if (err.response?.status === 404) {
          await axios.put(
            `${backendUrl}/api/appointments/${id}/status`,
            { status, reason },
            { headers }
          );
        } else {
          throw err;
        }
      }
      toast.success(status === 'Confirmed' ? '✅ Teleconsultation Confirmed' : 'Request Declined');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  const handleDirectDocUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.warning('Please select a diagnostic report or file to upload.');
      return;
    }
    if (!selectedUploadApptId) {
      toast.warning('Please select an appointment record for this document.');
      return;
    }

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('report', uploadFile);
    formData.append('appointmentId', selectedUploadApptId);
    formData.append('remarks', uploadRemarks || 'Patient Diagnostic Report');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${backendUrl}/api/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Clinical document uploaded successfully!');
      setUploadFile(null);
      setUploadRemarks('');
      fetchDashboardData();
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const openPrescriptionDrawer = async (appt) => {
    setDrawerLoading(true);
    setIsPrescriptionDrawerOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendUrl}/api/prescriptions/${appt.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrawerPrescription({
        ...res.data,
        appointmentId: appt.id,
        doctorName: appt.doctor_name,
        patientName: appt.patient_name || user?.fullName,
        date: appt.appointment_date,
        time: appt.appointment_time,
        specialization: appt.specialization
      });
    } catch (err) {
      setDrawerPrescription(null);
      toast.info('No digital prescription recorded yet for this appointment.');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${backendUrl}/api/appointments/complete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Consultation marked as Completed.');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete appointment.');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Cancel this consultation request?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Appointment cancelled successfully.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to cancel appointment.');
    }
  };

  const toggleEmergencyDoctorMode = async () => {
    try {
      const token = localStorage.getItem('token');
      const newState = !isEmergencyActive;
      await axios.put(
        `${backendUrl}/api/users/emergency-status`,
        { active: newState },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEmergencyActive(newState);
      updateUser({ is_emergency_active: newState });
      toast.info(newState ? '🟢 Emergency Mode Online (10-Min SLA Enforced)' : '⚫ Emergency Mode Standby');
    } catch (err) {
      toast.error('Failed to toggle emergency mode.');
    }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    const userText = chatMessage;
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setChatMessage('');
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${backendUrl}/api/ai/chat`,
        { message: userText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.data.reply || 'Clinical response completed.'
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Horizon AI Triage Node currently calibrating. Please retry in a moment.'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleReversePenalty = async (transactionId, reason) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${backendUrl}/api/admin/penalties/${transactionId}/reverse`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Penalty reversed and funds credited back to doctor.');
      setAdminPenaltyModal({ open: false, transaction: null });
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reverse penalty.');
    }
  };

  // Pending emergency appointments
  const pendingEmergencies = useMemo(() => {
    return appointments.filter((a) => a.is_emergency && a.status === 'Pending');
  }, [appointments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader type="text" count={1} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SkeletonLoader type="stat" count={4} />
          </div>
          <SkeletonLoader type="table-row" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ===================================================================
            SECTION 1: DASHBOARD HEADER
           =================================================================== */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full glass border border-cyan-500/30 text-cyan-400">
                Horizon Care OS 3.0
              </span>
              {isAdmin && <Badge preset="admin" />}
              {isDoctor && <Badge preset="doctor" />}
              {isPatient && <Badge preset="patient" />}
              {user?.is_emergency_active && <Badge preset="emergency" />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
              {isAdmin && 'Directorate Oversight & SLA Governance'}
              {isDoctor && 'Specialist Command & Emergency Triage'}
              {isPatient && 'Patient Teleconsultation & Health Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Welcome back, <span className="font-bold text-[var(--text-primary)]">{user?.fullName || user?.email}</span>. Live telemetry node synchronized.
            </p>
          </div>

          {/* Quick Doctor Controls */}
          {isDoctor && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleEmergencyDoctorMode}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border ${
                  isEmergencyActive
                    ? 'bg-rose-500 text-white border-rose-500 shadow-glow-emergency animate-pulse'
                    : 'glass border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-rose-400'
                }`}
              >
                <Zap className={`h-3.5 w-3.5 ${isEmergencyActive ? 'fill-white' : ''}`} />
                <span>{isEmergencyActive ? '10-Min SLA Online' : 'Emergency Standby'}</span>
              </button>
            </div>
          )}

          {/* Quick Patient Controls */}
          {isPatient && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center gap-1.5 hover:brightness-110 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Launch AI Triage</span>
              </button>
              <Link
                to="/doctors"
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-cyan-400/40 flex items-center gap-1.5 transition-all"
              >
                <Stethoscope className="h-3.5 w-3.5 text-cyan-400" />
                <span>Find Doctor</span>
              </Link>
            </div>
          )}
        </div>

        {/* ===================================================================
            SECTION 2: CRITICAL EMERGENCY SLA ALERT BANNER
           =================================================================== */}
        {pendingEmergencies.length > 0 && (
          <div className="space-y-3">
            {pendingEmergencies.map((emg) => (
              <motion.div
                key={emg.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 shadow-glow-emergency flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500 rounded-xl text-white shadow-glow-emergency animate-pulse">
                    <Zap className="h-6 w-6 fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300 px-2 py-0.5 rounded bg-rose-500/20">
                        Priority Level 1 • 10-Min SLA Enforced
                      </span>
                    </div>
                    <h3 className="text-base font-display font-bold text-white mt-1">
                      {isDoctor
                        ? `Emergency SOS Dispatch from ${emg.patient_name || 'Patient'}`
                        : `Connecting with Dr. ${emg.doctor_name || 'Specialist'}`}
                    </h3>
                    <EmergencyTimer
                      timeoutAt={emg.timeout_at}
                      onExpire={fetchDashboardData}
                      isPatient={isPatient}
                    />
                  </div>
                </div>

                {isDoctor && (
                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button
                      onClick={() => handleStatusUpdate(emg.id, 'Confirmed')}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 text-white shadow-glow-emerald hover:brightness-110 flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      Accept SOS (Single-Click)
                    </button>
                    <button
                      onClick={() => setDeclineModal({ open: true, apptId: emg.id, isEmergency: true })}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider glass border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 flex items-center justify-center gap-1.5"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Live Call Active Banner */}
        {liveSession && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 shadow-glow-emerald flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-glow-emerald animate-pulse">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block">
                  Horizon Teleconsultation Active
                </span>
                <h4 className="font-display font-bold text-base text-[var(--text-primary)]">
                  {isDoctor
                    ? `Live Telehealth Session with ${liveSession.patient_name}`
                    : `Dr. ${liveSession.doctor_name} is waiting in the Teleconsultation Room`}
                </h4>
              </div>
            </div>

            <a
              href={liveSession.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <Video className="h-4 w-4" />
              Enter Secure Telehealth Room
            </a>
          </motion.div>
        )}

        {/* ===================================================================
            SECTION 3: ROLE-SPECIFIC VIEWS
           =================================================================== */}

        {/* ─────────────────────────────────────────────────────────────────
            ROLE: ADMIN DASHBOARD
           ───────────────────────────────────────────────────────────────── */}
        {isAdmin && (
          <div className="space-y-8">
            {/* Admin Stats Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Platform Users"
                value={adminStats?.total_users || 0}
                change="+12% this week"
                changeType="positive"
                icon={Users}
                color="cyan"
              />
              <StatCard
                title="Active Emergencies"
                value={adminStats?.active_emergencies || 0}
                change="10-Min SLA Monitored"
                changeType="neutral"
                icon={Zap}
                color="amber"
              />
              <StatCard
                title="SLA Compliance Rate"
                value={`${parseFloat(adminStats?.avg_response_rate || 100).toFixed(1)}%`}
                change="UNESCO Standard >= 95%"
                changeType="positive"
                icon={ShieldAlert}
                color="emerald"
              />
              <StatCard
                title="Total SLA Penalties"
                value={`₹${parseFloat(adminStats?.total_penalties || 0).toLocaleString('en-IN')}`}
                change="Recorded Violations"
                changeType="negative"
                icon={AlertCircle}
                color="rose"
              />
            </div>

            {/* Provider Verification & Status Registry */}
            <GlassCard padding="lg" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    UNESCO Medical Officer Registry & SLA Performance
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Audited practitioner telemetry, response time percentiles, and warning violations.
                  </p>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="p-2 rounded-lg glass text-[var(--text-muted)] hover:text-cyan-400 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="uppercase text-[10px] tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="py-3 px-4">Specialist</th>
                      <th className="py-3 px-4">Specialty</th>
                      <th className="py-3 px-4">Reliability</th>
                      <th className="py-3 px-4">SOS Requests</th>
                      <th className="py-3 px-4">Accept / Reject</th>
                      <th className="py-3 px-4">Warning Score</th>
                      <th className="py-3 px-4">SLA Penalties</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {doctorMetrics.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[var(--bg-tertiary)]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                          {doc.full_name}
                        </td>
                        <td className="py-3 px-4 text-cyan-400 font-mono">
                          {doc.specialization}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-emerald-400">
                            {doc.reliability_score}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {doc.total_emergency_requests}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="text-emerald-400 font-bold">{doc.accepted_count}</span>
                          <span className="text-[var(--text-muted)]"> / </span>
                          <span className="text-rose-400">{doc.rejected_count}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            Number(doc.warning_count) > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            {doc.warning_count} / 3
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-400">
                          ₹{doc.total_penalty_amount || 0}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            doc.is_emergency_active
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-white/5 text-[var(--text-muted)]'
                          }`}>
                            {doc.is_emergency_active ? 'SOS Active' : 'Standby'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            ROLE: DOCTOR DASHBOARD
           ───────────────────────────────────────────────────────────────── */}
        {isDoctor && (
          <div className="space-y-8">
            {/* Doctor Command Center Stats Strip & SLA Penalty Score Tracking */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Teleconsultations"
                value={stats?.total_appointments || 0}
                change="All-time consultations"
                changeType="positive"
                icon={Calendar}
                color="cyan"
              />
              <StatCard
                title="Pending Triage Queue"
                value={stats?.pending_requests || 0}
                change="Awaiting acceptance"
                changeType="neutral"
                icon={Clock}
                color="amber"
              />
              <StatCard
                title="SLA Reliability & Penalty Score"
                value={`${doctorProfile?.reliability_score ?? 100}%`}
                change={`${doctorProfile?.warning_count || 0}/3 Warnings • ₹${parseFloat(doctorProfile?.total_penalty_amount || 0).toLocaleString('en-IN')} Penalties`}
                changeType={Number(doctorProfile?.warning_count || 0) > 0 ? "negative" : "positive"}
                icon={ShieldAlert}
                color="rose"
              />
              <StatCard
                title="Clinical Earnings"
                value={`₹${parseFloat(stats?.total_revenue || doctorProfile?.wallet_balance || 0).toLocaleString('en-IN')}`}
                change="Disbursable Balance"
                changeType="positive"
                icon={Wallet}
                color="azure"
              />
            </div>

            {/* Doctor Incoming Consultation Queue */}
            <GlassCard padding="lg" className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    Incoming Patient Consultations & Active Queue
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Single-click acceptance, digital prescription issuance, and clinical document review.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {appointments.length} Total Visits
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Calendar className="h-10 w-10 text-[var(--text-muted)] mx-auto opacity-40" />
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">No consultations in queue.</p>
                  <p className="text-xs text-[var(--text-muted)]">When patients request teleconsultations, they will appear here instantly.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const isConfirmed = appt.status === 'Confirmed';
                    const isPending = appt.status === 'Pending';
                    const isCompleted = appt.status === 'Completed';

                    return (
                      <div
                        key={appt.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          appt.is_emergency
                            ? 'bg-rose-500/5 border-rose-500/30'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
                            appt.is_emergency ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/15 text-cyan-400'
                          }`}>
                            {appt.patient_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">
                                {appt.patient_name}
                              </h4>
                              {appt.is_emergency && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white">
                                  SOS Emergency
                                </span>
                              )}
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isConfirmed ? 'bg-emerald-500/15 text-emerald-400' :
                                isPending ? 'bg-amber-500/15 text-amber-400' :
                                isCompleted ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/5 text-[var(--text-muted)]'
                              }`}>
                                {appt.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 font-mono">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-cyan-400" />
                                {new Date(appt.appointment_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-cyan-400" />
                                {appt.appointment_time}
                              </span>
                              {appt.patient_phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-cyan-400" />
                                  {appt.patient_phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Doctor Actions */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(appt.id, 'Confirmed')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-glow-emerald hover:brightness-110 flex items-center gap-1"
                              >
                                <Check className="h-3.5 w-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => setDeclineModal({ open: true, apptId: appt.id, isEmergency: appt.is_emergency })}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center gap-1"
                              >
                                <X className="h-3.5 w-3.5" /> Decline
                              </button>
                            </>
                          )}

                          {isConfirmed && (
                            <>
                              {appt.meeting_link && (
                                <a
                                  href={appt.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center gap-1 hover:brightness-110"
                                >
                                  <Video className="h-3.5 w-3.5" /> Join Room
                                </a>
                              )}
                              <button
                                onClick={() => handleCompleteAppointment(appt.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 flex items-center gap-1"
                              >
                                <CheckSquare className="h-3.5 w-3.5" /> Complete
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setPrescriptionAppt(appt)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400 flex items-center gap-1"
                          >
                            <Pill className="h-3.5 w-3.5 text-emerald-400" /> Digital Rx
                          </button>

                          <button
                            onClick={() => setRecordsAppt(appt)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400 flex items-center gap-1"
                          >
                            <FileText className="h-3.5 w-3.5 text-cyan-400" /> Lab Records
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            ROLE: PATIENT DASHBOARD
           ───────────────────────────────────────────────────────────────── */}
        {isPatient && (
          <div className="space-y-8">
            {/* Patient Stats Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Upcoming Consultations"
                value={stats?.total_appointments || 0}
                change="Confirmed Telehealth"
                changeType="positive"
                icon={Calendar}
                color="azure"
              />
              <StatCard
                title="Pending Triage Requests"
                value={stats?.pending || 0}
                change="Under Doctor Review"
                changeType="neutral"
                icon={Clock}
                color="amber"
              />
              <StatCard
                title="Completed Consultations"
                value={stats?.confirmed || 0}
                change="Verified Clinical Records"
                changeType="positive"
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                title="UNESCO Care Subsidy"
                value="Tier 1"
                change="Subsidized Consultations"
                changeType="positive"
                icon={Award}
                color="cyan"
              />
            </div>

            {/* AI Triage Quick Banner */}
            <GlassCard variant="cyan" padding="lg" className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0077D4] to-[#00F0FF] text-white shadow-glow-cyan shrink-0">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Instant AI Clinical Triage Assistant
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
                    Undergo preliminary symptom triage, receive certified medication interaction guidelines, and route directly to an on-call emergency trauma specialist.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(true)}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center gap-2 hover:brightness-110 whitespace-nowrap transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Start AI Triage Session</span>
              </button>
            </GlassCard>

            {/* Upcoming Consultations Table */}
            <GlassCard padding="lg" className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    Your Scheduled Teleconsultations
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Upcoming video sessions, digital prescriptions, and clinical document uploads.
                  </p>
                </div>
                <Link
                  to="/doctors"
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Book New <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Calendar className="h-10 w-10 text-[var(--text-muted)] mx-auto opacity-40" />
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">No upcoming teleconsultations</p>
                  <Link
                    to="/doctors"
                    className="inline-block px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-cyan"
                  >
                    Browse Specialist Directory
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const isConfirmed = appt.status === 'Confirmed';
                    const isPending = appt.status === 'Pending';

                    return (
                      <div
                        key={appt.id}
                        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                          appt.is_emergency
                            ? 'bg-rose-500/5 border-rose-500/30'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
                            appt.is_emergency ? 'bg-rose-500/20 text-rose-400' : 'gradient-primary text-white shadow-glow-cyan'
                          }`}>
                            {appt.doctor_name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">
                                Dr. {appt.doctor_name}
                              </h4>
                              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                                {appt.specialization}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isConfirmed ? 'bg-emerald-500/15 text-emerald-400' :
                                isPending ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-[var(--text-muted)]'
                              }`}>
                                {appt.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 font-mono">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-cyan-400" />
                                {new Date(appt.appointment_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-cyan-400" />
                                {appt.appointment_time}
                              </span>
                              {appt.address && (
                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                  <MapPin className="h-3 w-3 text-cyan-400" />
                                  {appt.address}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Patient Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          {isConfirmed && appt.meeting_link && (
                            <a
                              href={appt.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center gap-1 hover:brightness-110"
                            >
                              <Video className="h-3.5 w-3.5" /> Join Video
                            </a>
                          )}

                          <button
                            onClick={() => setPrescriptionAppt(appt)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-400 flex items-center gap-1"
                          >
                            <Pill className="h-3.5 w-3.5 text-emerald-400" /> Prescription
                          </button>

                          <button
                            onClick={() => setRecordsAppt(appt)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400 flex items-center gap-1"
                          >
                            <Upload className="h-3.5 w-3.5 text-cyan-400" /> Medical Docs
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => setRescheduleAppt(appt)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appt.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass border border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>

            {/* Document Upload & Clinical Diagnostic Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard padding="lg" className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="font-display font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                      <Upload className="h-4 w-4 text-cyan-400" />
                      Upload Clinical Records & Lab Reports
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Secure encrypted upload (GET /api/documents, POST /api/documents/upload)
                    </p>
                  </div>
                </div>

                <form onSubmit={handleDirectDocUpload} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Associated Consultation *
                    </label>
                    <select
                      value={selectedUploadApptId}
                      onChange={(e) => setSelectedUploadApptId(e.target.value)}
                      className="glass-input w-full text-xs py-2 px-3 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    >
                      <option value="">Select Appointment</option>
                      {appointments.map((a) => (
                        <option key={a.id} value={a.id} className="bg-[#0A0F24] text-white">
                          #{a.id} • Dr. {a.doctor_name} ({new Date(a.appointment_date).toLocaleDateString()} {a.appointment_time})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Diagnostic File (PDF / Images) *
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="glass-input w-full text-xs py-2 px-3 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Clinical Remarks / Note
                    </label>
                    <input
                      type="text"
                      value={uploadRemarks}
                      onChange={(e) => setUploadRemarks(e.target.value)}
                      placeholder="e.g. Complete Blood Count (CBC) • fasting sample"
                      className="glass-input w-full text-xs py-2 px-3"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingDoc || !uploadFile || !selectedUploadApptId}
                    className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center justify-center gap-1.5 hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {uploadingDoc ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Encrypting & Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload to Health Records Vault</span>
                      </>
                    )}
                  </button>
                </form>
              </GlassCard>

              {/* Digital Prescription Download Drawer & Archive Card */}
              <GlassCard padding="lg" className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="font-display font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                      <Pill className="h-4 w-4 text-emerald-400" />
                      Prescription Download Drawer
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Instant access & download for verified digital prescriptions
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {appointments.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] text-center py-6">
                      No consultations recorded yet.
                    </p>
                  ) : (
                    appointments.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">
                            Dr. {a.doctor_name}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">
                            {new Date(a.appointment_date).toLocaleDateString()} • {a.specialization}
                          </p>
                        </div>
                        <button
                          onClick={() => openPrescriptionDrawer(a)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider glass border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1 transition-all"
                        >
                          <Download className="h-3 w-3" />
                          <span>View / Download Rx</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION 4: MODALS & DRAWERS
           =================================================================== */}

        {/* Reschedule Modal */}
        {rescheduleAppt && (
          <RescheduleModal
            isOpen={Boolean(rescheduleAppt)}
            onClose={() => setRescheduleAppt(null)}
            appointment={rescheduleAppt}
            onUpdate={fetchDashboardData}
          />
        )}

        {/* Digital Prescription Modal */}
        {prescriptionAppt && (
          <PrescriptionModal
            isOpen={Boolean(prescriptionAppt)}
            onClose={() => setPrescriptionAppt(null)}
            appointment={prescriptionAppt}
            userRole={role}
          />
        )}

        {/* Medical Document & Lab Records Modal */}
        {recordsAppt && (
          <RecordsModal
            isOpen={Boolean(recordsAppt)}
            onClose={() => setRecordsAppt(null)}
            appointment={recordsAppt}
            userRole={role}
          />
        )}

        {/* Prescription Download Drawer Modal */}
        {isPrescriptionDrawerOpen && (
          <Modal
            isOpen={isPrescriptionDrawerOpen}
            onClose={() => {
              setIsPrescriptionDrawerOpen(false);
              setDrawerPrescription(null);
            }}
            title="Verified Digital Prescription"
            subtitle="UNESCO Horizon Care Certified Digital Rx"
            size="md"
          >
            {drawerLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                <span className="text-xs text-[var(--text-muted)]">Retrieving prescription record...</span>
              </div>
            ) : drawerPrescription ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Practitioner:</span>
                    <span className="font-bold text-[var(--text-primary)]">Dr. {drawerPrescription.doctorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Patient:</span>
                    <span className="font-bold text-[var(--text-primary)]">{drawerPrescription.patientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Consultation Date:</span>
                    <span className="font-mono text-cyan-400">{new Date(drawerPrescription.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Prescribed Medicines & Formulations
                  </label>
                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono text-xs whitespace-pre-wrap text-[var(--text-primary)]">
                    {drawerPrescription.medicines || 'No medicines recorded.'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Clinical Instructions & Follow-up
                  </label>
                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs whitespace-pre-wrap text-[var(--text-secondary)]">
                    {drawerPrescription.instructions || 'No special clinical instructions.'}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsPrescriptionDrawerOpen(false);
                      setDrawerPrescription(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold glass border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold gradient-primary text-white shadow-glow-cyan flex items-center justify-center gap-1.5 hover:brightness-110"
                  >
                    <Download className="h-4 w-4" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Pill className="h-8 w-8 text-[var(--text-muted)] mx-auto opacity-40" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">No Prescription On File</p>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                  The attending specialist has not yet finalized a digital prescription for this appointment.
                </p>
              </div>
            )}
          </Modal>
        )}

        {/* Decline Reason Modal */}
        <DeclineReasonModal
          isOpen={declineModal.open}
          isEmergency={declineModal.isEmergency}
          onConfirm={async (reason) => {
            await handleStatusUpdate(declineModal.apptId, 'Cancelled', reason);
            setDeclineModal({ open: false, apptId: null, isEmergency: false });
          }}
          onClose={() => setDeclineModal({ open: false, apptId: null, isEmergency: false })}
        />

        {/* Admin Penalty Reversal Modal */}
        {adminPenaltyModal.open && (
          <PenaltyReverseModal
            isOpen={adminPenaltyModal.open}
            transaction={adminPenaltyModal.transaction}
            onConfirm={handleReversePenalty}
            onClose={() => setAdminPenaltyModal({ open: false, transaction: null })}
          />
        )}

        {/* AI Health Triage Assistant Drawer */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-6 right-6 w-88 sm:w-96 h-[520px] z-[200] glass-card overflow-hidden flex flex-col border border-cyan-500/30 shadow-glow-cyan"
            >
              {/* Drawer Header */}
              <div className="gradient-primary p-4 flex items-center justify-between text-white shadow-md">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <div>
                    <h4 className="font-display font-bold text-sm leading-tight">Horizon AI Triage Assistant</h4>
                    <span className="text-[10px] text-cyan-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      UNESCO Health AI Certified
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat Message Stream */}
              <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-none bg-[#050814]/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.sender === 'bot'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'gradient-primary text-white shadow-glow-cyan'
                      }`}
                    >
                      {msg.sender === 'bot' ? <Bot className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                    </div>
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed max-w-[82%] ${
                        msg.sender === 'bot'
                          ? 'glass border border-[var(--border-subtle)] text-[var(--text-primary)]'
                          : 'gradient-primary text-white shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="glass p-3 rounded-xl border border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      <span>Synthesizing clinical assessment...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAIChat} className="p-3 border-t border-[var(--border-subtle)] flex gap-2 bg-[var(--bg-secondary)]">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Describe symptoms, vital readings..."
                  className="glass-input flex-1 text-xs py-2 px-3"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatMessage.trim()}
                  className="p-2 gradient-primary rounded-xl text-white disabled:opacity-50 shadow-glow-cyan hover:brightness-110"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Dashboard;
