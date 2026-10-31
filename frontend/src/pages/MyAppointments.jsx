import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PrescriptionModal from '../components/PrescriptionModal';
import RecordsModal from '../components/RecordsModal';
import ReviewModal from '../components/ReviewModal';
import {
  Calendar, Clock, MapPin, Video, FileText, FolderOpen, Star, Crown,
  Check, X, Zap, Filter, AlertTriangle, Loader2, ExternalLink, ShieldCheck,
  CheckCircle2, Pill, Upload, Download, Phone, RefreshCw, Maximize2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import GradientText from '../components/ui/GradientText';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import useCountdown from '../hooks/useCountdown';

// ── Emergency Countdown Timer ──────────────────────────────────────────────
const EmergencyTimer = ({ timeoutAt, onExpire, isPatient }) => {
  const { minutes, seconds, isExpired, totalSeconds } = useCountdown(timeoutAt);

  useEffect(() => {
    if (isExpired && onExpire) onExpire();
  }, [isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-rose-500">
        <AlertTriangle className="h-3.5 w-3.5" />
        {isPatient ? 'SLA Expired — Auto-Rerouting Practitioner' : 'Response Window Expired — Penalty Applied'}
      </div>
    );
  }

  return (
    <div
      className={`mt-1 flex items-center gap-1.5 font-mono font-bold text-xs ${
        totalSeconds < 180 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
      }`}
    >
      <Clock className="h-3 w-3" />
      <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
      <span className="text-[10px] font-sans font-normal text-[var(--text-muted)]">
        {isPatient ? 'waiting for doctor' : 'SLA window'}
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
      toast.warning('Please provide a clinical or administrative reason.');
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
      title={isEmergency ? 'Decline Emergency Triage' : 'Decline Appointment'}
      subtitle="UNESCO Horizon Care Quality Protocol"
      size="md"
    >
      <div className="space-y-4">
        {isEmergency && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Declining an Emergency SOS is logged in practitioner compliance telemetry.</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Reason for Declining *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isEmergency
                ? 'e.g. Currently in surgical procedure, ICU transfer required...'
                : 'e.g. Schedule conflict, patient out of specialty scope...'
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

// ── Embedded Jitsi Teleconsultation Viewport ────────────────────────────────
const JitsiVideoModal = ({ isOpen, onClose, appointment, userRole }) => {
  if (!isOpen || !appointment) return null;

  const meetingUrl =
    appointment.meeting_link || `https://meet.jit.si/AegisGlobal-Telehealth-${appointment.id}`;

  const otherPersonName =
    userRole === 'doctor' ? appointment.patient_name : `Dr. ${appointment.doctor_name}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Secure Telehealth: ${otherPersonName}`}
      subtitle="UNESCO Horizon Care • End-to-End Encrypted P2P Video Link"
      size="full"
    >
      <div className="space-y-3">
        {/* Call Top Ribbon */}
        <div className="p-3 rounded-xl bg-[#050814]/80 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
              256-Bit P2P Encrypted Call
            </span>
            {appointment.is_emergency && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white shadow-glow-emergency">
                10-Min Emergency SLA Session
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold glass border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Pop Out Window
            </a>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
            >
              Exit Telehealth
            </button>
          </div>
        </div>

        {/* Embedded Video Iframe */}
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-black">
          <iframe
            src={`${meetingUrl}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false`}
            title="Embedded Jitsi Video Call"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-[68vh] border-0"
          />
        </div>
      </div>
    </Modal>
  );
};

// ===========================================================================
// MAIN COMPONENT: MyAppointments
// ===========================================================================
export const MyAppointments = () => {
  const { user, socket } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming'); // 'All' | 'Upcoming' | 'Emergency' | 'Completed' | 'Cancelled'

  // Modals state
  const [activeVideoAppt, setActiveVideoAppt] = useState(null);
  const [selectedPrescriptionAppt, setSelectedPrescriptionAppt] = useState(null);
  const [selectedRecordAppt, setSelectedRecordAppt] = useState(null);
  const [selectedReviewDoctorId, setSelectedReviewDoctorId] = useState(null);
  const [declineModal, setDeclineModal] = useState({ open: false, apptId: null, isEmergency: false });

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const isDoctor = user?.role === 'doctor';

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${backendUrl}/api/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, backendUrl]);

  // Real-time socket sync
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchAppointments();

    socket.on('appointment:status', refresh);
    socket.on('emergency:new', refresh);
    socket.on('emergency:accepted', refresh);
    socket.on('emergency:reassigned', refresh);
    socket.on('penalty:applied', refresh);

    return () => {
      socket.off('appointment:status', refresh);
      socket.off('emergency:new', refresh);
      socket.off('emergency:accepted', refresh);
      socket.off('emergency:reassigned', refresh);
      socket.off('penalty:applied', refresh);
    };
  }, [socket]);

  // Status updates
  const handleStatusUpdate = async (id, newStatus, reason) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${backendUrl}/api/appointments/status/${id}`,
        { status: newStatus, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(newStatus === 'Confirmed' ? '✅ Teleconsultation Confirmed' : 'Appointment Declined');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
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
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete appointment.');
    }
  };

  // Tab counts & filtering
  const tabCounts = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Pending').length;
    const emergency = appointments.filter((a) => Boolean(a.is_emergency)).length;
    const completed = appointments.filter((a) => a.status === 'Completed').length;
    const cancelled = appointments.filter((a) => a.status === 'Cancelled' || a.status === 'Expired').length;

    return { total, upcoming, emergency, completed, cancelled };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    switch (activeTab) {
      case 'Upcoming':
        return appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Pending');
      case 'Emergency':
        return appointments.filter((a) => Boolean(a.is_emergency));
      case 'Completed':
        return appointments.filter((a) => a.status === 'Completed');
      case 'Cancelled':
        return appointments.filter((a) => a.status === 'Cancelled' || a.status === 'Expired');
      case 'All':
      default:
        return appointments;
    }
  }, [appointments, activeTab]);

  const tabs = [
    { label: 'Upcoming', count: tabCounts.upcoming },
    { label: 'Emergency', count: tabCounts.emergency },
    { label: 'Completed', count: tabCounts.completed },
    { label: 'Cancelled', count: tabCounts.cancelled },
    { label: 'All', count: tabCounts.total }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <SkeletonLoader type="text" count={1} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonLoader type="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full glass border border-cyan-500/30 text-cyan-400">
                AegisGlobal Telehealth Gateway
              </span>
              <Badge preset={isDoctor ? 'doctor' : 'patient'} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
              {isDoctor ? 'Patient Telehealth Appointments' : 'My Teleconsultations & Video Rooms'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Embedded P2P video links, digital prescription archives, and laboratory report uploads.
            </p>
          </div>

          <button
            onClick={fetchAppointments}
            className="p-2.5 rounded-xl glass border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
            title="Refresh schedule"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.label;
            const isEmergencyTab = tab.label === 'Emergency';

            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap ${
                  isActive
                    ? isEmergencyTab
                      ? 'bg-rose-500 text-white border-rose-500 shadow-glow-emergency'
                      : 'gradient-primary text-white border-transparent shadow-glow-cyan'
                    : 'glass border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-cyan-400/30'
                }`}
              >
                {isEmergencyTab && <Zap className="h-3 w-3 fill-current" />}
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-[var(--text-muted)]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Appointment Grid / Cards */}
        {filteredAppointments.length === 0 ? (
          <GlassCard padding="xl" className="text-center py-16 space-y-3">
            <Calendar className="h-10 w-10 text-[var(--text-muted)] mx-auto opacity-40" />
            <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
              No {activeTab.toLowerCase()} appointments found
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {activeTab === 'Upcoming'
                ? 'You do not have any pending or confirmed sessions scheduled right now.'
                : `There are currently no visits matching the ${activeTab} filter.`}
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAppointments.map((appt) => {
                const isConfirmed = appt.status === 'Confirmed';
                const isPending = appt.status === 'Pending';
                const isCompleted = appt.status === 'Completed';
                const isCancelled = appt.status === 'Cancelled' || appt.status === 'Expired';
                const hasActiveCall = isConfirmed;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={appt.id}
                  >
                    <GlassCard
                      variant={appt.is_emergency ? 'emergency' : isConfirmed ? 'azure' : 'default'}
                      padding="lg"
                      className="transition-all"
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        {/* Left: Practitioner/Patient Info */}
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl shrink-0 shadow-md ${
                              appt.is_emergency
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-glow-emergency'
                                : isConfirmed
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald'
                                : 'gradient-primary text-white shadow-glow-cyan'
                            }`}
                          >
                            {(isDoctor ? appt.patient_name : appt.doctor_name)?.charAt(0) || 'D'}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                                {isDoctor ? appt.patient_name : `Dr. ${appt.doctor_name}`}
                              </h3>

                              {appt.is_emergency && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-glow-emergency">
                                  <Zap className="h-3 w-3 fill-white" /> SOS 10-Min SLA
                                </span>
                              )}

                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isConfirmed
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isPending
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : isCompleted
                                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {appt.status}
                              </span>
                            </div>

                            <p className="text-xs text-cyan-400 font-mono font-semibold">
                              {appt.specialization || 'Clinical Teleconsultation'}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-mono pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                                {new Date(appt.appointment_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                                {appt.appointment_time}
                              </span>
                              {appt.address && !isDoctor && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                                  {appt.address}
                                </span>
                              )}
                              {appt.patient_phone && isDoctor && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3.5 w-3.5 text-cyan-400" />
                                  {appt.patient_phone}
                                </span>
                              )}
                            </div>

                            {/* Emergency countdown if pending */}
                            {appt.is_emergency && isPending && (
                              <EmergencyTimer
                                timeoutAt={appt.timeout_at}
                                onExpire={fetchAppointments}
                                isPatient={!isDoctor}
                              />
                            )}
                          </div>
                        </div>

                        {/* Right: Actions Controls */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                          {/* Embedded Video Call Button */}
                          {isConfirmed && (
                            <button
                              onClick={() => setActiveVideoAppt(appt)}
                              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center gap-1.5 hover:brightness-110 transition-all animate-pulse"
                            >
                              <Video className="h-4 w-4" />
                              <span>Embedded Video Call</span>
                            </button>
                          )}

                          {/* Digital Prescription Viewer */}
                          <button
                            onClick={() => setSelectedPrescriptionAppt(appt)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                          >
                            <Pill className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Prescription</span>
                          </button>

                          {/* Medical Records / Lab Docs */}
                          <button
                            onClick={() => setSelectedRecordAppt(appt)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                          >
                            <FolderOpen className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Documents</span>
                          </button>

                          {/* Doctor specific pending acceptance */}
                          {isDoctor && isPending && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(appt.id, 'Confirmed')}
                                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-glow-emerald hover:brightness-110 flex items-center gap-1"
                              >
                                <Check className="h-3.5 w-3.5" /> Accept
                              </button>
                              <button
                                onClick={() =>
                                  setDeclineModal({ open: true, apptId: appt.id, isEmergency: appt.is_emergency })
                                }
                                className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider glass border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center gap-1"
                              >
                                <X className="h-3.5 w-3.5" /> Decline
                              </button>
                            </>
                          )}

                          {/* Doctor completion button */}
                          {isDoctor && isConfirmed && (
                            <button
                              onClick={() => handleCompleteAppointment(appt.id)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                            </button>
                          )}

                          {/* Review Doctor (Patient Only upon completion) */}
                          {!isDoctor && isCompleted && (
                            <button
                              onClick={() => setSelectedReviewDoctorId(appt.doctor_id)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider glass border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex items-center gap-1"
                            >
                              <Star className="h-3.5 w-3.5 text-amber-400" /> Rate Visit
                            </button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Embedded Jitsi Video Modal */}
        <JitsiVideoModal
          isOpen={Boolean(activeVideoAppt)}
          onClose={() => setActiveVideoAppt(null)}
          appointment={activeVideoAppt}
          userRole={user?.role}
        />

        {/* Digital Prescription Modal */}
        {selectedPrescriptionAppt && (
          <PrescriptionModal
            isOpen={Boolean(selectedPrescriptionAppt)}
            onClose={() => setSelectedPrescriptionAppt(null)}
            appointment={selectedPrescriptionAppt}
            userRole={user?.role}
          />
        )}

        {/* Records Modal */}
        {selectedRecordAppt && (
          <RecordsModal
            isOpen={Boolean(selectedRecordAppt)}
            onClose={() => setSelectedRecordAppt(null)}
            appointment={selectedRecordAppt}
            userRole={user?.role}
          />
        )}

        {/* Review Modal */}
        {selectedReviewDoctorId && (
          <ReviewModal
            isOpen={Boolean(selectedReviewDoctorId)}
            onClose={() => setSelectedReviewDoctorId(null)}
            doctorId={selectedReviewDoctorId}
            onSuccess={() => {
              setSelectedReviewDoctorId(null);
              fetchAppointments();
            }}
          />
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

      </div>
    </div>
  );
};

export default MyAppointments;
