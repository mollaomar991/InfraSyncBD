import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  action?: ReactNode;
}

function PageHeader({
  eyebrow = 'INFRASYNC BD',
  title,
  description,
  actions,
  action,
}: PageHeaderProps) {
  const renderedActions = actions ?? action;

  return (
    <header className="page-header page-enter">
      <div>
        <span className="page-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {renderedActions && (
        <div className="page-actions">{renderedActions}</div>
      )}
    </header>
  );
}

export default PageHeader;
