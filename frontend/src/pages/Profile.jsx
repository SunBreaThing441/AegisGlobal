import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  User, Mail, Phone, MapPin, Briefcase, IndianRupee, Clock,
  Calendar, Save, ChevronDown, AlertCircle, FileText, Activity,
  Shield, Heart, Droplets, AlertTriangle, Sparkles, Check, CheckCircle2,
  Stethoscope, Building2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUndertaking, setShowUndertaking] = useState(false);

  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Master Form Data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    dob: '',
    address: '',
    // Doctor specific
    specialization: '',
    consultation_fee: '',
    availability: '',
    is_emergency: false,
    // Patient specific Vitals & Emergency Contacts
    blood_group: 'O+',
    blood_pressure: '120/80',
    heart_rate: '72',
    allergies: 'None',
    emergency_contact_name: '',
    emergency_contact_relation: 'Spouse/Family',
    emergency_contact_phone: ''
  });

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data || {};
        let addressStr = data.address || '';
        let vitalsData = {};

        // Check local storage for persistent vitals
        const cachedVitals = localStorage.getItem(`patient_vitals_${user?.id}`);
        if (cachedVitals) {
          try {
            vitalsData = JSON.parse(cachedVitals);
          } catch (e) {
            console.warn('Failed parsing cached vitals:', e);
          }
        }

        // Parse address if serialized
        let cleanAddress = addressStr;
        if (addressStr.includes('||VITALS||')) {
          const parts = addressStr.split('||VITALS||');
          cleanAddress = parts[0].trim();
          try {
            const parsed = JSON.parse(parts[1]);
            vitalsData = { ...vitalsData, ...parsed };
          } catch (e) {}
        }

        setFormData({
          full_name: data.full_name || user?.fullName || '',
          email: data.email || user?.email || '',
          phone_number: data.phone_number || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          address: cleanAddress,
          specialization: data.specialization || 'General Physician',
          consultation_fee: data.consultation_fee || '500',
          availability: data.availability || 'Mon - Fri: 09:00 AM - 05:00 PM',
          is_emergency: Boolean(data.is_emergency),
          blood_group: vitalsData.blood_group || 'O+',
          blood_pressure: vitalsData.blood_pressure || '120/80',
          heart_rate: vitalsData.heart_rate || '72',
          allergies: vitalsData.allergies || 'None',
          emergency_contact_name: vitalsData.emergency_contact_name || '',
          emergency_contact_relation: vitalsData.emergency_contact_relation || 'Family',
          emergency_contact_phone: vitalsData.emergency_contact_phone || ''
        });
      } catch (err) {
        console.error('Fetch profile error:', err);
        toast.error('Failed to load profile from Horizon Gateway.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user, backendUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmergencyToggle = () => {
    if (!formData.is_emergency) {
      setShowUndertaking(true);
    } else {
      setFormData((prev) => ({ ...prev, is_emergency: false }));
    }
  };

  const confirmUndertaking = () => {
    setFormData((prev) => ({ ...prev, is_emergency: true }));
    setShowUndertaking(false);
    toast.success('Emergency Responder Status Confirmed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      // Pack vitals metadata into address payload for DB persistence
      const vitalsObj = {
        blood_group: formData.blood_group,
        blood_pressure: formData.blood_pressure,
        heart_rate: formData.heart_rate,
        allergies: formData.allergies,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_relation: formData.emergency_contact_relation,
        emergency_contact_phone: formData.emergency_contact_phone
      };

      // Cache locally
      if (user?.id) {
        localStorage.setItem(`patient_vitals_${user.id}`, JSON.stringify(vitalsObj));
      }

      const formattedAddress = formData.address
        ? `${formData.address} ||VITALS|| ${JSON.stringify(vitalsObj)}`
        : `Default Hub ||VITALS|| ${JSON.stringify(vitalsObj)}`;

      const payload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        dob: formData.dob || null,
        address: formattedAddress,
        specialization: formData.specialization,
        consultation_fee: formData.consultation_fee,
        availability: formData.availability,
        is_emergency: formData.is_emergency
      };

      await axios.put(`${backendUrl}/api/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('UNESCO Horizon Profile Synchronized Successfully!');
      updateUser({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        is_emergency: formData.is_emergency
      });
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
            Loading Horizon Identity...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* Emergency Responder Undertaking Modal */}
      <Modal
        isOpen={showUndertaking}
        onClose={() => setShowUndertaking(false)}
        title="Emergency Responder Undertaking"
        subtitle="UNESCO Horizon Care Quality & Response Charter"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200/90 leading-relaxed">
              By activating Emergency Response status, you consent to being listed in the priority triage directory and agree to enforce the 10-minute SLA response window.
            </div>
          </div>

          <div className="space-y-2 text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-tertiary)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
            <p>1. 10-Minute SLA acknowledgment on emergency dispatch.</p>
            <p>2. Direct WebSocket audio/visual notification broadcast.</p>
            <p>3. Automatic failure penalty of ₹1,000 for unexcused timeout.</p>
            <p>4. Dynamic recalculation of clinician reliability score.</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUndertaking(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold glass border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmUndertaking}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-glow-emergency flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              I Agree & Activate
            </button>
          </div>
        </div>
      </Modal>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full glass border border-cyan-500/30 text-cyan-400">
                Identity & Medical Vitals
              </span>
              <Badge preset={isDoctor ? 'doctor' : 'patient'} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
              {isDoctor ? 'Specialist Clinical Profile' : 'Personal Health & Vitals Registry'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Manage your personal credentials, vital telemetry, and emergency contacts under UNESCO security protocols.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow-cyan text-lg font-display font-bold">
            {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Identity & Contact Information */}
          <GlassCard padding="lg" className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <User className="h-4 w-4 text-cyan-400" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                General Identity & Contact
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="glass-input w-full pl-10 pr-3 text-sm py-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="glass-input w-full pl-10 pr-3 text-sm py-2.5 opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="glass-input w-full pl-10 pr-3 text-sm py-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="glass-input w-full pl-10 pr-3 text-sm py-2.5"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Residential Address / Global Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Geneva Global Medical Hub, Suite 402, Switzerland"
                    className="glass-input w-full pl-10 pr-3 text-sm py-2.5"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section 2: Personal Vitals & Emergency Contacts (Patient View) */}
          {isPatient && (
            <GlassCard padding="lg" className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
                <Heart className="h-4 w-4 text-rose-400" />
                <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                  Clinical Vitals & Emergency Contact Hotline
                </h3>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-rose-400" /> Blood Group
                  </label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="glass-input w-full text-sm py-2.5 px-3 cursor-pointer appearance-none bg-[var(--bg-secondary)]"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg} className="bg-[#0A0F24] text-white">
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    name="blood_pressure"
                    value={formData.blood_pressure}
                    onChange={handleChange}
                    placeholder="120/80 mmHg"
                    className="glass-input w-full text-sm py-2.5 px-3"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Resting Heart Rate
                  </label>
                  <input
                    type="text"
                    name="heart_rate"
                    value={formData.heart_rate}
                    onChange={handleChange}
                    placeholder="72 bpm"
                    className="glass-input w-full text-sm py-2.5 px-3"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Allergies / Flags
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Penicillin, Pollen"
                    className="glass-input w-full text-sm py-2.5 px-3"
                  />
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block">
                  Priority Emergency Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="glass-input w-full text-sm py-2.5 px-3"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_relation"
                      value={formData.emergency_contact_relation}
                      onChange={handleChange}
                      placeholder="e.g. Spouse / Brother"
                      className="glass-input w-full text-sm py-2.5 px-3"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Hotline Phone
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 999-9999"
                      className="glass-input w-full text-sm py-2.5 px-3"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Section 3: Clinical Practice Settings (Doctor View) */}
          {isDoctor && (
            <GlassCard padding="lg" className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
                <Stethoscope className="h-4 w-4 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                  Clinical Practice & Honorarium
                </h3>
              </div>

              {/* Emergency Status Switch */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  formData.is_emergency
                    ? 'bg-rose-500/10 border-rose-500/30 shadow-glow-emergency'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      formData.is_emergency ? 'bg-rose-500 text-white' : 'glass text-[var(--text-muted)]'
                    }`}
                  >
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">
                      Emergency 10-Minute SLA Responder
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Receive immediate audio/visual triage dispatches and telemetry requests.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEmergencyToggle}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    formData.is_emergency ? 'bg-rose-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      formData.is_emergency ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Primary Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="glass-input w-full text-sm py-2.5 px-3"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Consultation Fee (INR ₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      type="number"
                      name="consultation_fee"
                      value={formData.consultation_fee}
                      onChange={handleChange}
                      className="glass-input w-full pl-10 pr-3 text-sm py-2.5 font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Operating Schedule & Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      placeholder="Mon - Fri: 09:00 AM - 05:00 PM"
                      className="glass-input w-full pl-10 pr-3 text-sm py-2.5"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider gradient-primary text-white shadow-glow-cyan hover:brightness-110 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Horizon Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
