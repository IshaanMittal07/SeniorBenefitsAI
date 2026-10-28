import React from 'react';

interface SpinnerProps {
  label: string;
  size?: 'sm' | 'lg';
}

/**
 * Loading indicator with a text label that screen readers announce.
 */
export const Spinner: React.FC<SpinnerProps> = ({ label, size = 'lg' }) => {
  const dimensions = size === 'lg' ? 'h-12 w-12 border-4' : 'h-5 w-5 border-2';
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 text-center">
      <span
        aria-hidden="true"
        className={`inline-block animate-spin rounded-full border-brand-200 border-t-brand-700 ${dimensions}`}
      />
      <span className={size === 'lg' ? 'text-lg text-ink-muted' : 'sr-only'}>{label}</span>
    </div>
  );
};
