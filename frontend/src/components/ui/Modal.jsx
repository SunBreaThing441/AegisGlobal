import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'w-full max-w-[96vw] sm:max-w-[92vw] max-h-[96vh] sm:max-h-[92vh]',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  badge,
  className = '',
}) => {
  const modalRef = useRef(null);

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          className="fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-6"
        >
          {/* Backdrop with Horizon Cyber Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050814]/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`
              relative z-10 w-full ${sizeMap[size] || sizeMap.md}
              glass-panel rounded-2xl sm:rounded-3xl overflow-hidden
              border border-[var(--border-primary)]
              shadow-2xl shadow-cyan-950/50
              p-4 sm:p-7
              ${className}
            `}
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent-cyan)]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-[var(--border-subtle)] relative z-10">
              <div className="space-y-1 pr-2">
                {badge && <div className="mb-2">{badge}</div>}
                {title && (
                  <h3
                    id="modal-title"
                    className="text-lg sm:text-xl font-display font-bold text-[var(--text-primary)] flex items-center gap-2"
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                aria-label="Close dialog"
                className="p-2 sm:p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)]/40 transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Body with Custom Scrollbar */}
            <div className="relative z-10 max-h-[72vh] overflow-y-auto pr-1 scrollbar-none">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
