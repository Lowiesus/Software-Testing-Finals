import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => {
      onClose?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}
