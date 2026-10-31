import { motion } from 'framer-motion';

const variantStyles = {
  default: {
    border: 'border-[var(--border-primary)]',
    hoverBorder: 'hover:border-[var(--accent-cyan)]/40',
    glow: 'hover:shadow-glow-cyan',
    bg: 'bg-[var(--glass-bg)]',
  },
  azure: {
    border: 'border-[#0077D4]/30',
    hoverBorder: 'hover:border-[#0077D4]/60',
    glow: 'hover:shadow-glow-azure',
    bg: 'bg-[#0077D4]/5',
  },
  cyan: {
    border: 'border-[#00F0FF]/25',
    hoverBorder: 'hover:border-[#00F0FF]/50',
    glow: 'hover:shadow-glow-cyan',
    bg: 'bg-[#00F0FF]/5',
  },
  emerald: {
    border: 'border-[#10B981]/25',
    hoverBorder: 'hover:border-[#10B981]/50',
    glow: 'hover:shadow-glow-emerald',
    bg: 'bg-[#10B981]/5',
  },
  amber: {
    border: 'border-[#F59E0B]/25',
    hoverBorder: 'hover:border-[#F59E0B]/50',
    glow: 'hover:shadow-glow-amber',
    bg: 'bg-[#F59E0B]/5',
  },
  emergency: {
    border: 'border-[#F43F5E]/35',
    hoverBorder: 'hover:border-[#F43F5E]/70',
    glow: 'hover:shadow-glow-emergency',
    bg: 'bg-[#F43F5E]/10',
  },
  metallic: {
    border: 'border-white/10',
    hoverBorder: 'hover:border-[var(--accent-cyan)]/40',
    glow: 'hover:shadow-metallic-card',
    bg: 'bg-[var(--glass-card)]',
  },
};

const paddingMap = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-4 sm:p-8',
  xl: 'p-5 sm:p-10',
};

export const GlassCard = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  glow = false,
  metallic = false,
  onClick,
  padding = 'md',
  ...rest
}) => {
  const styles = variantStyles[variant] || variantStyles.default;
  const pad = paddingMap[padding] || paddingMap.md;

  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.004 } : undefined}
      whileTap={onClick ? { scale: 0.995 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`
        glass-card ${pad}
        ${styles.bg}
        border ${styles.border}
        ${hover ? styles.hoverBorder : ''}
        ${glow ? styles.glow : ''}
        ${metallic ? 'border-gradient-metallic shadow-glow-white' : ''}
        transition-all duration-300
        relative overflow-hidden
        ${className}
      `}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
