import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  block?: boolean;
}

function LoadingButton({
  loading = false,
  loadingText = 'Processing…',
  children,
  variant = 'primary',
  fullWidth = false,
  block = false,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const isFullWidth = fullWidth || block;
  const classes = [
    'button',
    'road-button',
    `button-${variant}`,
    `road-button-${variant}`,
    isFullWidth ? 'button-full road-button-block' : '',
    loading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="button-spinner" aria-hidden="true" />}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}

export default LoadingButton;
