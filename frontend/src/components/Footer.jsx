import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, ShieldCheck, HeartPulse, Globe2, Radio, Award, ExternalLink } from 'lucide-react';
import Badge from './ui/Badge';

export const Footer = () => {
  const { socketConnected, theme, toggleTheme } = useContext(AuthContext);

  return (
    <footer className="relative bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] pt-16 pb-12 overflow-hidden transition-colors">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[var(--accent-azure)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent-cyan)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--border-subtle)]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-azure">
                <Globe2 className="h-5 w-5 text-white animate-spin-slow" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-black tracking-tight text-[var(--text-primary)]">
                  Aegis<span className="gradient-text-primary">Global</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--accent-cyan)] -mt-0.5">
                  UNESCO Horizon Care Network
                </span>
              </div>
            </Link>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
              Deploying universal AI triage, rapid emergency teleconsultation, and enforced doctor SLA accountability under the UNESCO Social Healthcare Framework.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge type="grant" />
              <Badge type="sla" />
            </div>
          </div>

          {/* Column 2: Clinical Protocols */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-[var(--accent-cyan)]" />
              Clinical Modules
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <Link to="/doctors" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Rapid Emergency SOS (10m)
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Cardiovascular Telemetry
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Pediatric Health Network
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Jan Aushadhi Generic Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Telemetry & AI */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-2">
              <Radio className="h-4 w-4 text-[var(--accent-emerald)]" />
              Infrastructure
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <span className="text-[var(--text-secondary)]">Google Gemini 2.0 Flash AI</span>
              </li>
              <li>
                <span className="text-[var(--text-secondary)]">Supabase Cloud Gateway</span>
              </li>
              <li>
                <span className="text-[var(--text-secondary)]">Socket.IO Realtime Telemetry</span>
              </li>
              <li>
                <span className="text-[var(--text-secondary)]">Jitsi Encrypted Video Engine</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--accent-azure)]" />
              Accountability
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <Link to="/dashboard" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Doctor SLA Metrics
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Transparent Wallet Ledger
                </Link>
              </li>
              <li>
                <Link to="/activity" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Cryptographic Audit Trail
                </Link>
              </li>
              <li>
                <span className="text-xs text-[var(--text-muted)]">HIPAA & UNESCO Compliant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold text-[var(--text-secondary)]">
                {socketConnected ? 'UNESCO Horizon Telemetry: ONLINE' : 'UNESCO Gateway: STANDBY'}
              </span>
            </div>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">Latency: ~24ms</span>
          </div>

          <div className="flex items-center gap-4">
            <span>© 2026 AegisGlobal Care Network. All rights reserved.</span>
            <button
              onClick={toggleTheme}
              className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline"
            >
              Mode: {theme.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
