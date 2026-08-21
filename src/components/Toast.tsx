import { useApp } from '../context/AppContext';

function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className={`toast-message toast-${toast.type}`} role="status">
      <span className="toast-dot" />
      <p>{toast.message}</p>
    </div>
  );
}

export default Toast;
