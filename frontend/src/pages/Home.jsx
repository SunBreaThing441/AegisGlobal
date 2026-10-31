import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowRight, Shield, Zap, Brain, Video, Clock, Star,
  Heart, Activity, Stethoscope, Lock, CheckCircle2,
  Award, Globe2, Radio, Siren, Sparkles, ChevronRight,
  TrendingUp, Users, ShieldCheck, FileCheck2
} from 'lucide-react';
import ParticleBackground from '../components/ui/ParticleBackground';
import GradientText from '../components/ui/GradientText';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const Home = () => {
  const { user, isDoctor } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  const impactMetrics = [
    {
      title: 'Lives Saved',
      value: 52480,
      suffix: '+',
      trend: '+18.4% this cycle',
      icon: Activity,
      variant: 'cyan',
      description: 'Acute emergency interventions',
    },
    {
      title: 'Subsidized Consultations Funded',
      value: 14850,
      prefix: '₹',
      suffix: 'M',
      decimals: 1,
      trend: '100% Subsidized',
      icon: Award,
      variant: 'azure',
      description: 'UNESCO Global Health Grant',
    },
    {
      title: 'Emergency SLA Success Rate',
      value: 99.2,
      suffix: '%',
      decimals: 1,
      trend: '< 95s avg response',
      icon: Clock,
      variant: 'emerald',
      description: '10-Minute Doctor SLA Guarantee',
    },
    {
      title: 'Accredited Specialists',
      value: 2400,
      suffix: '+',
      trend: '68 Global Sectors',
      icon: Stethoscope,
      variant: 'amber',
      description: '24/7 Verified Emergency Roster',
    },
  ];

  const pillarTabs = [
    {
      id: 'ai-triage',
      title: 'AI Emergency Triage',
      badge: 'Gemini 2.0 Flash',
      icon: Brain,
      headline: 'Next-Generation Clinical Diagnostics & Symptom Intelligence',
      description: 'Trained on modern evidence-based triage protocols, the Aegis AI Assistant analyzes acute symptoms in milliseconds, recommends immediate clinical actions, maps regional specialists, and surfaces PM Jan Aushadhi generic medications.',
      highlights: [
        'Real-time automated severity categorization & triage',
        'Direct integration with Jan Aushadhi generic formulary',
        'Multi-lingual symptom translation for cross-border humanitarian care',
        'Zero-latency emergency SOS trigger recommendation',
      ],
      actionText: 'Experience AI Health Assistant',
      actionLink: '/dashboard',
    },
    {
      id: 'sos-sla',
      title: '10-Minute Doctor SLA Guarantee',
      badge: 'Enforced Protocol',
      icon: Siren,
      headline: 'Guaranteed Rapid Physician Response with Financial Accountability',
      description: 'When seconds matter, AegisGlobal guarantees a 10-minute maximum response window. Should an assigned specialist fail to respond, the network automatically issues a financial warning/penalty and re-routes the emergency to the next available emergency specialist.',
      highlights: [
        '10-Minute countdown with real-time WebSocket telemetry',
        'Automated cascading re-assignment to next online doctor',
        'Transparent ₹1,000 SLA penalty applied on timeout',
        'Instant one-click encrypted Jitsi teleconsultation room generation',
      ],
      actionText: 'Dispatch Emergency SOS',
      actionLink: '/doctors?filter=sos',
    },
    {
      id: 'teleconsult',
      title: 'P2P Telehealth',
      badge: 'UNESCO Framework',
      icon: Video,
      headline: 'Subsidized Universal Telemedicine Across 68 Borderless Sectors',
      description: 'AegisGlobal democratizes access to world-class medical specialists through peer-to-peer encrypted high-definition video consultations, standardized digital prescriptions, and transparent health credits.',
      highlights: [
        'Zero-install browser-based encrypted video rooms',
        'Structured digital prescriptions with dosage validation',
        'Integrated medical record vault with encrypted file sharing',
        'Subsidized fee tiers supported by international health grants',
      ],
      actionText: 'Explore Accredited Doctors',
      actionLink: '/doctors',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. HERO SECTION                                                        */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-16 px-4">
        {/* Futuristic Cyber Atmosphere */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ParticleBackground particleCount={35} color="cyan" speed={0.4} />
          <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-[#0077D4]/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-[#00F0FF]/10 rounded-full blur-[140px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
          {/* Horizon Badge */}
          <motion.div {...fadeUp} className="inline-flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-[var(--accent-cyan)]/30 text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] shadow-glow-cyan">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-ping" />
              <span>UNESCO Horizon Social Healthcare Initiative</span>
              <span className="hidden sm:inline-block text-[var(--accent-cyan)] font-mono">• Active Node 01</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.08] tracking-tight text-[var(--text-primary)]">
              Universal Healthcare,{' '}
              <br />
              <GradientText gradient="primary" animate className="font-display">
                Guaranteed by SLA
              </GradientText>
            </h1>
            <p className="mt-6 text-base sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              AegisGlobal combines <strong>Gemini 2.0 Flash AI triage</strong>, an enforced{' '}
              <strong>10-minute Emergency SOS guarantee</strong>, and subsidized teleconsultations to deliver borderless healthcare equity.
            </p>
          </motion.div>

          {/* Call to Actions */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link to={user ? '/dashboard' : '/register'} className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-azure flex items-center justify-center gap-3 group"
              >
                <span>{user ? 'Open Command Portal' : 'Deploy Aegis ID Free'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link to="/doctors?filter=sos" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider glass-panel border border-rose-500/40 text-rose-400 hover:border-rose-500 shadow-glow-emergency flex items-center justify-center gap-2.5"
              >
                <Siren className="h-4 w-4 animate-bounce text-rose-500" />
                <span>10-Min SOS Protocol</span>
              </motion.button>
            </Link>

            <Link to="/doctors" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider glass-panel border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--accent-cyan)]/40 flex items-center justify-center gap-2"
              >
                <Stethoscope className="h-4 w-4 text-[var(--accent-cyan)]" />
                <span>Specialist Roster</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Telemetry Impact Counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {impactMetrics.map((metric) => (
              <StatCard key={metric.title} {...metric} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. INTERACTIVE PILLARS & FEATURES SHOWCASE                             */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge type="grant" />
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--text-primary)]">
            UNESCO Social Service Architecture
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Bridging geographic divides with guaranteed response windows, autonomous AI intelligence, and decentralized humanitarian subsidies.
          </p>

          {/* Interactive Tab Selectors */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {pillarTabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isSelected = activeFeatureTab === idx;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(idx)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                    isSelected
                      ? 'gradient-primary text-white border-transparent shadow-glow-azure scale-105'
                      : 'glass-panel border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)]/40 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="mt-8">
          {pillarTabs.map((tab, idx) => {
            if (activeFeatureTab !== idx) return null;
            const Icon = tab.icon;
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-panel p-8 sm:p-12 rounded-3xl border border-[var(--border-primary)] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-cyan)]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="lg:col-span-7 space-y-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="unesco-badge unesco-badge-emerald">
                      {tab.badge}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      Protocol Ref: #{tab.id.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] leading-snug">
                    {tab.headline}
                  </h3>

                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    {tab.description}
                  </p>

                  <div className="space-y-3 pt-2">
                    {tab.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[var(--accent-cyan)]/15 border border-[var(--accent-cyan)]/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
                        </div>
                        <span className="text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                          {h}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link to={tab.actionLink}>
                      <button className="px-6 py-3.5 rounded-xl gradient-primary text-white text-xs font-bold uppercase tracking-wider shadow-glow-azure hover:opacity-95 transition-opacity inline-flex items-center gap-2">
                        <span>{tab.actionText}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Interactive Graphic / Card on Right */}
                <div className="lg:col-span-5 relative z-10">
                  <GlassCard variant="metallic" className="p-6 sm:p-8 space-y-6 border-cyan-500/30">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-azure">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)] uppercase">
                            Operational Node
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)]">UNESCO Global Network</p>
                        </div>
                      </div>
                      <Badge type="live" size="sm" />
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
                        <span className="text-[var(--text-muted)]">Encrypted Channel:</span>
                        <span className="font-mono font-bold text-[var(--accent-cyan)]">AES-256-GCM</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
                        <span className="text-[var(--text-muted)]">SLA Enforcer Daemon:</span>
                        <span className="font-mono font-bold text-emerald-400">ACTIVE (30s interval)</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
                        <span className="text-[var(--text-muted)]">Humanitarian Access:</span>
                        <span className="font-mono font-bold text-amber-400">Subsidized Tier Ready</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0077D4]/10 border border-[#0077D4]/30 text-center">
                      <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
                        Need immediate assistance? Our Level-1 Emergency Team is standing by 24/7.
                      </p>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. DOCTOR ACCOUNTABILITY & PENALTY TRANSPARENCY SECTION                 */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-16 px-4 max-w-6xl mx-auto relative z-10">
        <GlassCard variant="azure" className="p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <Badge type="sla" />
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--text-primary)]">
            How The 10-Minute SLA Emergency Protocol Protects You
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto">
            Unlike traditional telemedicine platforms where requests sit unattended, AegisGlobal enforces contractual rapid-response SLAs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="p-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/15 flex items-center justify-center text-[var(--accent-cyan)] font-black text-sm">
                01
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Instant Telemetry Broadcast</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Emergency request triggers WebSocket alarms directly on the on-call specialist's dashboard with a 10-minute countdown timer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 font-black text-sm">
                02
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Automatic Re-Routing</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                If the physician does not accept in 10 minutes, our scheduler re-assigns you instantly to the next highest-rated available specialist.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400 font-black text-sm">
                03
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Financial Accountability</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                First missed emergency incurs a formal warning; repeat infractions apply a ₹1,000 wallet penalty credited toward patient subsidy funds.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Home;
