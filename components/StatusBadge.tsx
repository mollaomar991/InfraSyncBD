import { statusTone } from '../utils';

interface StatusBadgeProps {
  status?: string;
  value?: string;
}

function StatusBadge({ status, value }: StatusBadgeProps) {
  const text = status ?? value ?? 'Unknown';

  return (
    <span className={`status-badge status-${statusTone(text)}`}>
      <span aria-hidden="true" />
      {text}
    </span>
  );
}

export default StatusBadge;
