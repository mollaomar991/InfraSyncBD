interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

function EmptyState({ icon = '○', title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default EmptyState;
