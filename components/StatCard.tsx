import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  note?: string;
  icon: ReactNode;
  tone?: 'orange' | 'red' | 'dark' | 'green' | 'blue';
  delay?: number;
}

function StatCard({
  label,
  value,
  detail,
  note,
  icon,
  tone = 'orange',
  delay = 0,
}: StatCardProps) {
  return (
    <article
      className={`stat-card stat-${tone} card-enter`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="stat-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <small>{detail ?? note ?? ''}</small>
      </div>
    </article>
  );
}

export default StatCard;
