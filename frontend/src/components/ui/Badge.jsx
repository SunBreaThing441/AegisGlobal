import { ShieldCheck, Siren, Award, Clock, Activity, CheckCircle2, User, Stethoscope, Shield } from 'lucide-react';

const presetConfig = {
  emergency: {
    label: 'Emergency Active',
    icon: Siren,
    className: 'unesco-badge-emergency text-rose-400 border-rose-500/40 bg-rose-500/15',
    pulse: true,
  },
  grant: {
    label: 'UNESCO Grant Approved',
    icon: Award,
    className: 'text-cyan-300 border-cyan-400/40 bg-[#0077D4]/20 shadow-glow-azure',
    pulse: false,
  },
  verified: {
    label: 'Verified Specialist',
    icon: ShieldCheck,
    className: 'unesco-badge-emerald text-emerald-300 border-emerald-500/40 bg-emerald-500/15 shadow-glow-emerald',
    pulse: false,
  },
  sla: {
    label: '10-Min SLA Enforced',
    icon: Clock,
    className: 'unesco-badge-amber text-amber-300 border-amber-500/40 bg-amber-500/15 shadow-glow-amber',
    pulse: true,
  },
  live: {
    label: 'Horizon Link Online',
    icon: Activity,
    className: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    pulse: true,
  },
  doctor: {
    label: 'Medical Specialist',
    icon: Stethoscope,
    className: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
    pulse: false,
  },
  admin: {
    label: 'Director Clearance',
    icon: Shield,
    className: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
    pulse: false,
  },
  patient: {
    label: 'Horizon Patient',
    icon: User,
    className: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
    pulse: false,
  },
};

const variantClasses = {
  azure: 'text-[#00F0FF] border-[#0077D4]/40 bg-[#0077D4]/15 shadow-glow-azure',
  cyan: 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/15 shadow-glow-cyan',
  emerald: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15 shadow-glow-emerald',
  amber: 'text-amber-300 border-amber-500/40 bg-amber-500/15 shadow-glow-amber',
  emergency: 'text-rose-400 border-rose-500/40 bg-rose-500/15 animate-emergency',
  neutral: 'text-[var(--text-secondary)] border-[var(--border-primary)] bg-[var(--bg-tertiary)]',
};

export const Badge = ({
  type,
  variant,
  label,
  icon: CustomIcon,
  pulse,
  className = '',
  size = 'md',
}) => {
  const preset = type ? presetConfig[type] : null;

  const finalLabel = label || preset?.label || '';
  const Icon = CustomIcon || preset?.icon;
  const isPulsing = pulse ?? preset?.pulse ?? false;

  const sizeClass = size === 'sm' 
    ? 'text-[10px] px-2.5 py-0.5 gap-1' 
    : size === 'lg' 
    ? 'text-xs px-3.5 py-1.5 gap-2' 
    : 'text-[11px] px-3 py-1 gap-1.5';

  const baseVariant = preset ? preset.className : variant ? variantClasses[variant] : variantClasses.azure;

  return (
    <span
      className={`
        inline-flex items-center font-bold tracking-wider uppercase rounded-full border backdrop-blur-md transition-all
        ${sizeClass}
        ${baseVariant}
        ${className}
      `}
    >
      {isPulsing && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{finalLabel}</span>
    </span>
  );
};

export default Badge;
