import React from 'react';
import { AlertIcon, CheckCircleIcon, InfoIcon } from './Icons';

type AlertVariant = 'error' | 'success' | 'info';

const styles: Record<AlertVariant, string> = {
  error: 'border-red-300 bg-red-50 text-red-900',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  info: 'border-brand-200 bg-brand-50 text-brand-900',
};

const icons: Record<AlertVariant, React.FC<{ size?: number; className?: string }>> = {
  error: AlertIcon,
  success: CheckCircleIcon,
  info: InfoIcon,
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Inline message box. Errors are announced immediately to screen readers;
 * other variants are announced politely.
 */
export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, children, className = '' }) => {
  const Icon = icons[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl border-2 px-4 py-3 ${styles[variant]} ${className}`}
    >
      <Icon size={24} className="mt-0.5 shrink-0" />
      <div>
        {title && <p className="font-bold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
};
