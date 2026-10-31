import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import GradientText from '../components/ui/GradientText';
import {
  Search,
  Star,
  IndianRupee,
  Clock,
  Lock,
  Sparkles,
  AlertCircle,
  Zap,
  MapPin,
  SlidersHorizontal,
  ShieldCheck,
  Award,
  Activity,
  HeartPulse,
  Filter,
  CheckCircle2,
  RefreshCw,
  Building2,
  Stethoscope
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const SPECIALTIES = [
  'All Specialties',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'General Physician',
  'Emergency Medicine'
];

export const Doctors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('specialty') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || 'All Specialties');
  const [minRating, setMinRating] = useState(0);
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [filterSubsidized, setFilterSubsidized] = useState(false);
  const [filterHighReliability, setFilterHighReliability] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalEmergencyMode, setModalEmergencyMode] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch real-time provider list
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/doctors`);
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      toast.error('Failed to load doctor directory. Reconnecting to Horizon gateway...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [backendUrl]);

  // Telemetry aggregates
  const telemetry = useMemo(() => {
    const total = doctors.length;
    const emergencyActive = doctors.filter((d) => d.is_emergency && d.is_emergency_active).length;
    const subsidized = doctors.filter((d) => Number(d.consultation_fee) <= 600).length;
    const totalScore = doctors.reduce((acc, d) => acc + (Number(d.reliability_score) || 98), 0);
    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : '98.5';

    return { total, emergencyActive, subsidized, avgScore };
  }, [doctors]);

  // Filter & sort logic
  const filteredDoctors = useMemo(() => {
    let result = doctors.filter((doc) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (doc.full_name || '').toLowerCase().includes(term) ||
        (doc.specialization || '').toLowerCase().includes(term) ||
        (doc.address || '').toLowerCase().includes(term) ||
        (doc.bio || '').toLowerCase().includes(term);

      const matchesSpecialty =
        selectedSpecialty === 'All Specialties' ||
        (doc.specialization || '').toLowerCase() === selectedSpecialty.toLowerCase();

      const matchesEmergency = filterEmergency
        ? Boolean(doc.is_emergency && doc.is_emergency_active)
        : true;

      const matchesSubsidized = filterSubsidized
        ? Number(doc.consultation_fee || 0) <= 600
        : true;

      const matchesReliability = filterHighReliability
        ? Number(doc.reliability_score || 0) >= 98
        : true;

      const docRating = Number(doc.rating) || (Number(doc.reliability_score || 98) / 20);
      const matchesRating = minRating > 0 ? docRating >= minRating : true;

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesEmergency &&
        matchesSubsidized &&
        matchesReliability &&
        matchesRating
      );
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        const ratingA = Number(a.rating) || (Number(a.reliability_score || 98) / 20);
        const ratingB = Number(b.rating) || (Number(b.reliability_score || 98) / 20);
        return ratingB - ratingA;
      }
      if (sortBy === 'reliability') {
        return (Number(b.reliability_score) || 0) - (Number(a.reliability_score) || 0);
      }
      if (sortBy === 'fee-low') {
        return (Number(a.consultation_fee) || 0) - (Number(b.consultation_fee) || 0);
      }
      if (sortBy === 'experience') {
        return (Number(b.experience_years) || 0) - (Number(a.experience_years) || 0);
      }
      if (sortBy === 'name') {
        return (a.full_name || '').localeCompare(b.full_name || '');
      }
      // 'recommended': prioritize active emergency specialists then highest reliability
      if (a.is_emergency_active && !b.is_emergency_active) return -1;
      if (!a.is_emergency_active && b.is_emergency_active) return 1;
      return (Number(b.reliability_score) || 0) - (Number(a.reliability_score) || 0);
    });

    return result;
  }, [
    doctors,
    searchTerm,
    selectedSpecialty,
    minRating,
    filterEmergency,
    filterSubsidized,
    filterHighReliability,
    sortBy,
  ]);

  const handleBookClick = (doc, isEmergency = false) => {
    if (!user) {
      toast.info('Authentication required. Redirecting to Horizon Access...');
      navigate('/login');
      return;
    }
    setSelectedDoctor(doc);
    setModalEmergencyMode(isEmergency);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('All Specialties');
    setMinRating(0);
    setFilterEmergency(false);
    setFilterSubsidized(false);
    setFilterHighReliability(false);
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header & Mission Banner */}
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider glass border border-[#0077D4]/30 text-cyan-400 shadow-glow-azure">
            <Sparkles className="h-3.5 w-3.5" />
            <span>UNESCO Horizon Care Network • Specialist Directory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[var(--text-primary)] tracking-tight">
            Accredited Medical Specialists & <GradientText gradient="primary">Emergency Teleport</GradientText>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Directly connect with certified clinical practitioners, trauma surgeons, and humanitarian doctors under the UNESCO 10-Minute SLA Emergency Care Accord.
          </p>
        </motion.div>

        {/* Telemetry Impact Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        >
          <GlassCard variant="azure" padding="sm" className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block">
              Global Specialists
            </span>
            <span className="text-2xl sm:text-3xl font-display font-bold text-cyan-400 font-mono mt-1 block">
              {telemetry.total}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
              Active Network Nodes
            </span>
          </GlassCard>

          <GlassCard variant="emergency" padding="sm" className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300 block flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 fill-rose-400 animate-pulse" />
              10-Min SLA Ready
            </span>
            <span className="text-2xl sm:text-3xl font-display font-bold text-rose-400 font-mono mt-1 block">
              {telemetry.emergencyActive}
            </span>
            <span className="text-[11px] text-rose-200/80 mt-0.5 block">
              Live Trauma Surgeons
            </span>
          </GlassCard>

          <GlassCard variant="emerald" padding="sm" className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block flex items-center justify-center gap-1">
              <Award className="h-3 w-3" />
              UNESCO Subsidized
            </span>
            <span className="text-2xl sm:text-3xl font-display font-bold text-emerald-300 font-mono mt-1 block">
              {telemetry.subsidized}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
              Universal Access Tier
            </span>
          </GlassCard>

          <GlassCard variant="metallic" padding="sm" className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block">
              Network SLA Reliability
            </span>
            <span className="text-2xl sm:text-3xl font-display font-bold text-emerald-400 font-mono mt-1 block">
              {telemetry.avgScore}%
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
              Verified Response Rate
            </span>
          </GlassCard>
        </motion.div>

        {/* Search & Filter Command Center */}
        <GlassCard padding="md" className="space-y-4">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="w-full lg:flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search specialists by name, specialty, bio, or regional hub..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-11 pr-4 py-3 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="w-full lg:w-auto flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input py-2.5 px-3 text-xs font-semibold cursor-pointer appearance-none bg-[var(--bg-secondary)]"
              >
                <option value="recommended" className="bg-[#0A0F24] text-white">Recommended</option>
                <option value="rating" className="bg-[#0A0F24] text-white">Highest Rating (★)</option>
                <option value="reliability" className="bg-[#0A0F24] text-white">Highest Reliability</option>
                <option value="fee-low" className="bg-[#0A0F24] text-white">Lowest Consultation Fee</option>
                <option value="experience" className="bg-[#0A0F24] text-white">Most Experienced</option>
                <option value="name" className="bg-[#0A0F24] text-white">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Specialty Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap flex items-center gap-1 pr-1">
              <Filter className="h-3 w-3" /> Field:
            </span>
            {SPECIALTIES.map((spec) => {
              const active = selectedSpecialty === spec;
              return (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-gradient-to-r from-[#0077D4] to-[#00F0FF] text-white border-cyan-400 shadow-glow-cyan'
                      : 'glass border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/30'
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>

          {/* Quick Toggle Filters */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Filters:
            </span>

            {/* Rating Filter Chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Rating:
              </span>
              <div className="inline-flex rounded-lg p-0.5 glass border border-[var(--border-subtle)]">
                {[
                  { label: 'All', val: 0 },
                  { label: '4.0+ ★', val: 4.0 },
                  { label: '4.5+ ★', val: 4.5 },
                  { label: '4.8+ ★', val: 4.8 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setMinRating(item.val)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                      minRating === item.val
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setFilterEmergency(!filterEmergency)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                filterEmergency
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-glow-emergency'
                  : 'glass border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-rose-400'
              }`}
            >
              <Zap className={`h-3.5 w-3.5 ${filterEmergency ? 'fill-rose-400' : ''}`} />
              Emergency SOS Active Only
            </button>

            <button
              onClick={() => setFilterSubsidized(!filterSubsidized)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                filterSubsidized
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-glow-emerald'
                  : 'glass border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-400'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              UNESCO Subsidized (≤ ₹600)
            </button>

            <button
              onClick={() => setFilterHighReliability(!filterHighReliability)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                filterHighReliability
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-glow-cyan'
                  : 'glass border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Top Reliability (≥ 98%)
            </button>

            {(searchTerm || selectedSpecialty !== 'All Specialties' || minRating > 0 || filterEmergency || filterSubsidized || filterHighReliability) && (
              <button
                onClick={resetFilters}
                className="ml-auto text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 py-1 px-2 rounded hover:bg-cyan-500/10 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Reset Filters
              </button>
            )}
          </div>
        </GlassCard>

        {/* Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                  </div>
                </div>
                <div className="h-12 bg-white/5 rounded-xl" />
                <div className="h-10 bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <GlassCard padding="xl" className="text-center space-y-4">
            <Search className="h-12 w-12 text-[var(--text-muted)] mx-auto opacity-40" />
            <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
              No Network Specialists Match Your Query
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
              No registered UNESCO medical practitioners matched your selected criteria. Try resetting filters or broadening your specialty search.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider gradient-primary text-white shadow-glow-cyan"
            >
              Show All Specialists
            </button>
          </GlassCard>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDoctors.map((doc) => {
                const isEmergencyActive = Boolean(doc.is_emergency && doc.is_emergency_active);
                const isSubsidized = Number(doc.consultation_fee || 0) <= 600;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.2 }}
                    key={doc.id}
                  >
                    <GlassCard
                      variant={isEmergencyActive ? 'emergency' : 'azure'}
                      padding="none"
                      className="overflow-hidden h-full flex flex-col justify-between"
                    >
                      {/* Top Accent Strip */}
                      <div
                        className={`h-24 p-4 relative flex items-start justify-between ${
                          isEmergencyActive
                            ? 'bg-gradient-to-br from-rose-500/25 via-rose-500/10 to-transparent border-b border-rose-500/20'
                            : 'bg-gradient-to-br from-[#0077D4]/20 via-[#00F0FF]/10 to-transparent border-b border-[var(--border-subtle)]'
                        }`}
                      >
                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 max-w-[70%]">
                          {isEmergencyActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-glow-emergency">
                              <Zap className="h-3 w-3 fill-white" />
                              SOS 10-Min SLA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                              <ShieldCheck className="h-3 w-3" />
                              Verified
                            </span>
                          )}

                          {isSubsidized && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <Award className="h-2.5 w-2.5" />
                              Subsidized
                            </span>
                          )}
                        </div>

                        {/* Rating & Reliability Score */}
                        <div className="flex items-center gap-1.5">
                          <div className="glass px-2 py-1 rounded-full border border-amber-400/20 flex items-center gap-1 shadow-sm">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-mono font-bold text-amber-300">
                              {(Number(doc.rating) || (Number(doc.reliability_score || 98) / 20)).toFixed(1)}
                            </span>
                          </div>
                          <div className="glass px-2.5 py-1 rounded-full border border-[var(--border-subtle)] flex items-center gap-1.5 shadow-sm">
                            <Activity className="h-3 w-3 text-emerald-400" />
                            <span className="text-xs font-mono font-bold text-emerald-300">
                              {doc.reliability_score || 99}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between space-y-4">
                        {/* Avatar */}
                        <div className="flex items-end justify-between -mt-10 mb-2">
                          <div
                            className={`w-16 h-16 rounded-2xl p-0.5 border shadow-xl flex items-center justify-center font-display font-extrabold text-2xl ${
                              isEmergencyActive
                                ? 'bg-[#050814] border-rose-500/60 text-rose-400 shadow-glow-emergency'
                                : 'bg-[#050814] border-cyan-400/60 text-cyan-300 shadow-glow-cyan'
                            }`}
                          >
                            {doc.full_name?.charAt(0) || 'D'}
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
                              Honorarium
                            </span>
                            <div className="flex items-center justify-end text-lg font-bold font-mono text-[var(--text-primary)]">
                              <IndianRupee className="h-3.5 w-3.5 text-cyan-400" />
                              <span>{doc.consultation_fee}</span>
                              <span className="text-[10px] text-[var(--text-muted)] font-normal ml-0.5">/session</span>
                            </div>
                          </div>
                        </div>

                        {/* Doctor Specialty & Name */}
                        <div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
                              {doc.specialization}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              • {doc.experience_years || 10}+ Yrs
                            </span>
                          </div>

                          <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mt-1 group-hover:text-cyan-400 transition-colors">
                            {doc.full_name?.startsWith('Dr.') ? doc.full_name : `Dr. ${doc.full_name}`}
                          </h3>
                        </div>

                        {/* Location / Regional Medical Hub */}
                        {doc.address && (
                          <div className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
                            <Building2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{doc.address}</span>
                          </div>
                        )}

                        {/* Bio preview */}
                        {doc.bio && (
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                            {doc.bio}
                          </p>
                        )}

                        {/* Availability Bar */}
                        <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Clock className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="text-[11px] font-medium truncate max-w-[180px]">
                              {doc.availability || 'Daily: 09:00 AM - 05:00 PM'}
                            </span>
                          </div>
                          {doc.is_emergency && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                doc.is_emergency_active
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'bg-white/5 text-[var(--text-muted)]'
                              }`}
                            >
                              {doc.is_emergency_active ? 'Online' : 'Offline'}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2">
                          {!user ? (
                            <button
                              onClick={() => handleBookClick(doc)}
                              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-cyan-400/50 flex items-center justify-center gap-2 transition-all shadow-sm"
                            >
                              <Lock className="h-3.5 w-3.5 text-cyan-400" />
                              Login to Consult
                            </button>
                          ) : isEmergencyActive ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleBookClick(doc, false)}
                                className="py-3 px-3 rounded-xl font-bold text-xs tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-cyan-400/50 flex items-center justify-center gap-1.5 transition-all"
                              >
                                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                                Schedule
                              </button>
                              <button
                                onClick={() => handleBookClick(doc, true)}
                                className="py-3 px-3 rounded-xl font-bold text-xs tracking-wider bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-glow-emergency flex items-center justify-center gap-1.5 hover:brightness-110 transition-all animate-pulse"
                              >
                                <Zap className="h-3.5 w-3.5 fill-white" />
                                SOS Teleport
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleBookClick(doc, false)}
                              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider gradient-primary text-white shadow-glow-cyan hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Book Teleconsultation
                            </button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Dynamic Booking Modal */}
        {selectedDoctor && (
          <BookingModal
            isOpen={Boolean(selectedDoctor)}
            onClose={() => setSelectedDoctor(null)}
            doctor={selectedDoctor}
            initialEmergency={modalEmergencyMode}
            onBookingSuccess={() => {
              // Refresh doctor list to sync statuses if needed
              fetchDoctors();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Doctors;
