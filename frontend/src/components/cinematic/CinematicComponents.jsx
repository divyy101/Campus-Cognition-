import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

/**
 * Reveal — Fade-in on scroll. Clean animation utility.
 */
export const Reveal = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Backward compatibility alias
export const CinematicReveal = Reveal;

/**
 * PageHeader — Consistent page header with eyebrow, title, and optional description.
 */
export const PageHeader = ({ eyebrow, title, description, icon: Icon, actions, className = '' }) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="w-10 h-10 rounded-[10px] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-[var(--accent)]" />
            </div>
          )}
          <div>
            {eyebrow && (
              <span className="cc-eyebrow !text-white/80 mb-1 block drop-shadow-md">{eyebrow}</span>
            )}
            <h1 className="cc-h1 !text-white drop-shadow-lg">{title}</h1>
            {description && (
              <p className="cc-small !text-white/90 mt-1 max-w-xl drop-shadow-md">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

/**
 * MetricCard — Dashboard stat card with label, value, and optional footer.
 */
export const MetricCard = ({ label, value, footer, icon: Icon, className = '' }) => {
  return (
    <div className={`cc-card p-6 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="cc-eyebrow text-[var(--text-muted)]">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-[var(--text-muted)]" />}
      </div>
      <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{value}</div>
      {footer && <div className="mt-3 cc-caption">{footer}</div>}
    </div>
  );
};

/**
 * StatusDot — Simple status indicator dot with label.
 */
export const StatusDot = ({ status = 'active', label, className = '' }) => {
  const colors = {
    active: 'bg-[var(--success)]',
    analyzing: 'bg-[var(--warning)]',
    searching: 'bg-[var(--accent)]',
    error: 'bg-[var(--danger)]',
    idle: 'bg-[var(--text-muted)]',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${colors[status] || colors.idle}`} />
      {label && <span className="cc-caption">{label}</span>}
    </div>
  );
};

// Backward compatibility alias
export const AgentStatusIndicator = ({ status = 'active', type }) => {
  const label = status === 'active' ? 'Online' : status === 'analyzing' ? 'Processing' : status === 'searching' ? 'Scanning' : status;
  return <StatusDot status={status} label={label} />;
};

/**
 * EmptyState — Polished empty state with icon, title, description, and optional action.
 */
export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[var(--surface-sunken)] flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-[var(--text-muted)]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      {description && <p className="cc-small max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

/**
 * LoadingState — Contextual loading indicator with optional message.
 */
export const LoadingState = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}>
      <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
      <p className="cc-small">{message}</p>
    </div>
  );
};

/**
 * ErrorState — Error display with optional retry action.
 */
export const ErrorState = ({ message = 'Something went wrong.', onRetry, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-[var(--danger-soft)] flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-[var(--danger)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Error</h3>
      <p className="cc-small max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="cc-btn-secondary px-4 py-2 mt-5 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};
