import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon: Icon = Activity,
  trend,
  trendPositive = true,
  description,
  variant = 'azure',
  glow = true,
  className = '',
}) => {
  // Animated Counter Logic
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

  useEffect(() => {
    let startTime;
    const duration = 1200; // ms

    const animateValue = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * numericValue;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };

    requestAnimationFrame(animateValue);
  }, [numericValue]);

  const formattedValue = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.floor(displayValue).toLocaleString();

  return (
    <GlassCard
      variant={variant}
      glow={glow}
      padding="lg"
      className={`relative overflow-hidden group ${className}`}
    >
      {/* Horizon scanning light beam */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-[var(--accent-cyan)]/10 to-transparent blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-xl font-bold text-[var(--accent-cyan)]">{prefix}</span>}
            <span className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[var(--text-primary)]">
              {formattedValue}
            </span>
            {suffix && <span className="text-lg font-bold text-[var(--text-muted)]">{suffix}</span>}
          </div>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center shrink-0 shadow-inner-glow group-hover:border-[var(--accent-cyan)]/40 transition-colors">
          <Icon className="h-6 w-6 text-[var(--accent-cyan)] group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {(trend || description) && (
        <div className="relative z-10 mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trendPositive ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {trendPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend}
            </span>
          )}
          {description && (
            <span className="text-[var(--text-muted)] truncate max-w-[70%]">
              {description}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default StatCard;
