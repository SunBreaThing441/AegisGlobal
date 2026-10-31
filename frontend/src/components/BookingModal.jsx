import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Loader2,
  IndianRupee,
  ChevronDown,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  HeartPulse,
  Activity,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export const BookingModal = ({ isOpen, onClose, doctor, initialEmergency = false, onBookingSuccess }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const isEmergencyCapable = Boolean(doctor?.is_emergency && doctor?.is_emergency_active);
  const [isEmergencyMode, setIsEmergencyMode] = useState(initialEmergency && isEmergencyCapable);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Synchronize emergency mode when modal opens or doctor changes
  useEffect(() => {
    if (initialEmergency && isEmergencyCapable) {
      setIsEmergencyMode(true);
    } else {
      setIsEmergencyMode(false);
    }
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, [initialEmergency, isEmergencyCapable, isOpen]);

  // Generate dynamic time slots based on availability
  const timeSlots = useMemo(() => {
    if (!doctor?.availability) {
      return ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    }

    const availStr = doctor.availability;
    let startMinutes = 9 * 60; // 09:00 AM
    let endMinutes = 17 * 60; // 05:00 PM

    const timeMatch = availStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    if (timeMatch) {
      const parseToMinutes = (str) => {
        const parts = str.trim().split(/\s+/);
        let [h, m] = parts[0].split(':').map(Number);
        const mod = parts[1] ? parts[1].toUpperCase() : 'AM';
        if (mod === 'PM' && h !== 12) h += 12;
        if (mod === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
      };
      try {
        startMinutes = parseToMinutes(timeMatch[1]);
        endMinutes = parseToMinutes(timeMatch[2]);
      } catch (e) {
        console.warn('Failed parsing slot hours:', e);
      }
    }

    const slots = [];
    for (let m = startMinutes; m < endMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = min < 10 ? `0${min}` : min;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push(`${displayH}:${displayM} ${ampm}`);
    }
    return slots.length > 0
      ? slots
      : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
  }, [doctor?.availability]);

  // Set default slot
  useEffect(() => {
    if (timeSlots.length > 0 && !time) {
      setTime(timeSlots[0]);
    }
  }, [timeSlots, time]);

  // Availability validation
  const checkDayAvailability = (selectedDate) => {
    if (!doctor?.availability || !selectedDate) return true;
    const avail = doctor.availability.toLowerCase();
    if (avail.includes('daily') || avail.includes('24/7') || avail.includes('emergency')) {
      return true;
    }

    const match = avail.match(/(mon|tue|wed|thu|fri|sat|sun)\s*-\s*(mon|tue|wed|thu|fri|sat|sun)/i);
    if (match) {
      const days = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
      const startDay = days[match[1].toLowerCase()];
      const endDay = days[match[2].toLowerCase()];
      const selectedDay = new Date(selectedDate + 'T00:00:00').getDay();

      if (startDay !== undefined && endDay !== undefined) {
        if (startDay <= endDay) {
          return selectedDay >= startDay && selectedDay <= endDay;
        } else {
          return selectedDay >= startDay || selectedDay <= endDay;
        }
      }
    }
    return true;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    if (!checkDayAvailability(selectedDate)) {
      setValidationError(`Doctor available: ${doctor?.availability}`);
    } else {
      setValidationError('');
    }
  };

  const isSubsidized = Number(doctor?.consultation_fee || 0) <= 600;

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.info('Please log in to confirm your teleconsultation appointment.');
      navigate('/login');
      return;
    }

    if (!isEmergencyMode && !checkDayAvailability(date)) {
      toast.error(`Please select a day the doctor is available: ${doctor.availability}`);
      return;
    }

    setLoading(true);
    setValidationError('');

    try {
      const token = localStorage.getItem('token');
      const appointmentDate = isEmergencyMode
        ? new Date().toISOString().split('T')[0]
        : date;
      const appointmentTime = isEmergencyMode
        ? 'IMMEDIATE'
        : time;

      const payload = {
        doctorId: doctor.id,
        appointmentDate,
        appointmentTime,
        doctorName: doctor.full_name,
        isEmergency: isEmergencyMode,
      };

      const response = await axios.post(`${backendUrl}/api/appointments/book`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (isEmergencyMode) {
        toast.success('🚨 Emergency SOS Dispatched! Doctor has been notified under 10-Min SLA.');
      } else {
        toast.success('Teleconsultation session successfully booked!');
      }

      if (onBookingSuccess) {
        onBookingSuccess(response.data);
      }
      onClose();
    } catch (err) {
      console.error('Booking failed:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to book appointment. Please verify doctor availability.';
      setValidationError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEmergencyMode ? '🚨 Emergency SOS Teleport' : 'Schedule Teleconsultation'}
      subtitle="UNESCO Horizon Care Network • Humanitarian Telemedicine Gateway"
      size="lg"
    >
      <form onSubmit={handleBooking} className="space-y-6">
        {/* Doctor Summary Banner */}
        <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-bold shadow-md ${
                doctor.is_emergency
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-glow-emergency'
                  : 'bg-gradient-to-br from-[#0077D4] to-[#00F0FF] text-white shadow-glow-cyan'
              }`}
            >
              {doctor.full_name?.charAt(0) || 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-display font-bold text-base text-[var(--text-primary)]">
                  {doctor.full_name?.startsWith('Dr.') ? doctor.full_name : `Dr. ${doctor.full_name}`}
                </h4>
                {doctor.reliability_score && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {doctor.reliability_score}% SLA
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-cyan-400 tracking-wide mt-0.5">
                {doctor.specialization} • {doctor.experience_years || 10}+ Yrs Experience
              </p>
              {doctor.address && (
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-cyan-400" />
                  {doctor.address}
                </p>
              )}
            </div>
          </div>

          <div className="text-right sm:self-center bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
              Consultation Fee
            </span>
            <div className="flex items-center justify-end gap-1 text-base font-bold text-[var(--text-primary)] font-mono">
              <IndianRupee className="h-4 w-4 text-cyan-400" />
              <span>₹{doctor.consultation_fee}</span>
            </div>
            {isSubsidized && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block">
                UNESCO Subsidized
              </span>
            )}
          </div>
        </div>

        {/* Mode Selector (if doctor is emergency capable) */}
        {isEmergencyCapable && (
          <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setIsEmergencyMode(false)}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                !isEmergencyMode
                  ? 'bg-gradient-to-r from-[#0077D4] to-[#00A3FF] text-white shadow-glow-azure'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Standard Schedule
            </button>
            <button
              type="button"
              onClick={() => setIsEmergencyMode(true)}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isEmergencyMode
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-glow-emergency animate-pulse'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <Zap className="h-3.5 w-3.5 fill-rose-400" />
              Emergency SOS (10-Min SLA)
            </button>
          </div>
        )}

        {/* Emergency Mode Callout */}
        {isEmergencyMode ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-rose-500/35 bg-rose-500/10 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-glow-emergency animate-pulse">
                <Zap className="h-5 w-5 fill-white" />
              </div>
              <div>
                <h5 className="font-display font-bold text-sm text-rose-300">
                  Priority Emergency SOS Protocol Active
                </h5>
                <p className="text-xs text-rose-200/80">
                  Guaranteed 10-minute maximum response time SLA under UNESCO Humanitarian Charter.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#050814]/70 border border-rose-500/20 text-xs text-[var(--text-secondary)] space-y-1.5 font-mono">
              <div className="flex justify-between items-center text-[11px]">
                <span>Triage Priority:</span>
                <span className="text-rose-400 font-bold uppercase">Critical Level 1</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Doctor Notification:</span>
                <span className="text-emerald-400">Direct Socket.IO Broadcast</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Connection Target:</span>
                <span className="text-cyan-300">Instant Teleconsultation Room</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Standard Mode Inputs */
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>Operating Window:</span>
              </div>
              <span className="font-bold text-cyan-300">{doctor.availability || 'Daily: 09:00 AM - 05:00 PM'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Appointment Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={handleDateChange}
                    required={!isEmergencyMode}
                    className="glass-input w-full pl-10 pr-3 text-sm py-2.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Time Slot
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required={!isEmergencyMode}
                    className="glass-input w-full pl-10 pr-9 text-sm py-2.5 appearance-none cursor-pointer"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot} className="bg-[#0A0F24] text-white">
                        {slot}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Financial / UNESCO Subsidy breakdown */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5 text-xs text-[var(--text-secondary)]">
          <div className="flex justify-between items-center">
            <span>Specialist Base Honorarium:</span>
            <span className="font-mono">₹{doctor.consultation_fee}</span>
          </div>
          {isSubsidized && (
            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                UNESCO Horizon Care Subsidy:
              </span>
              <span className="font-mono font-bold">- Subsidized Tier</span>
            </div>
          )}
          <div className="border-t border-[var(--border-subtle)] pt-1.5 flex justify-between items-center font-bold text-[var(--text-primary)]">
            <span>Payable Amount:</span>
            <span className="font-mono text-cyan-400">₹{doctor.consultation_fee}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (!isEmergencyMode && Boolean(validationError))}
            className={`flex-[2] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isEmergencyMode
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-glow-emergency hover:brightness-110'
                : 'gradient-primary text-white shadow-glow-cyan hover:brightness-110'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Transmitting Telemetry...</span>
              </>
            ) : isEmergencyMode ? (
              <>
                <Zap className="h-4 w-4 fill-white" />
                <span>Transmit Emergency SOS</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Teleconsultation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
