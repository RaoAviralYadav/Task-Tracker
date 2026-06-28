import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Toast } from '@/types';

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const styles = {
  success: 'bg-white border-l-4 border-emerald-500 text-stone-800',
  error: 'bg-white border-l-4 border-red-500 text-stone-800',
  info: 'bg-white border-l-4 border-blue-500 text-stone-800',
};

const iconStyles = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

export function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border border-stone-100 min-w-[280px] max-w-[340px] animate-in slide-in-from-right-5 ${styles[toast.type]}`}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        animation: 'slideIn 0.2s ease-out',
      }}
    >
      <Icon size={16} className={`flex-shrink-0 ${iconStyles[toast.type]}`} />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-stone-400 hover:text-stone-700 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
