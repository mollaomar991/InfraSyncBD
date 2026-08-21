interface ProgressBarProps {
  value: number;
  label?: string;
  compact?: boolean;
}

function ProgressBar({ value, label, compact = false }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={compact ? 'progress-wrap compact' : 'progress-wrap'}>
      {(label || !compact) && (
        <div className="progress-label">
          <span>{label || 'Progress'}</span>
          <strong>{safeValue}%</strong>
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
