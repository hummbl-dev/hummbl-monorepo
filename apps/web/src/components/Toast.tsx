import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'system';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'system', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="min-w-[320px] border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 shadow-2xl backdrop-blur-md flex items-center gap-4">
        <div
          className={`h-2 w-2 rounded-full ${
            type === 'success'
              ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
              : 'bg-blue-500'
          }`}
        />
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500">
              System Notification
            </p>
            <span className="text-[10px] font-mono text-zinc-600">NOW</span>
          </div>
          <p className="font-sans text-sm font-medium tracking-tight text-zinc-200">{message}</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  emit: (message: string) =>
    window.dispatchEvent(new CustomEvent('hummbl-toast', { detail: message })),
};

export const ToastProvider: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<string>;
      setMessage(custom.detail);
    };

    window.addEventListener('hummbl-toast', handler as EventListener);
    return () => window.removeEventListener('hummbl-toast', handler as EventListener);
  }, []);

  if (!message) {
    return null;
  }

  return <Toast message={message} onClose={() => setMessage(null)} />;
};
