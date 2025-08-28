import { createContext, useCallback, useContext, useState, useRef, useEffect, type ReactNode } from 'react';

export interface Toast {
  id: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timeout?: number;
}

interface ToastContextValue {
  push: (t: Omit<Toast, 'id'>) => void;
  success: (message: string, timeout?: number) => void;
  error: (message: string, timeout?: number) => void;
  warning: (message: string, timeout?: number) => void;
  info: (message: string, timeout?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const liveRef = useRef<HTMLDivElement | null>(null);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { timeout: 4000, type: 'info', ...t, id };
    setToasts(prev => [...prev, toast]);
    if (toast.timeout) {
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), toast.timeout);
    }
  }, []);
  const success = useCallback((message: string, timeout?: number) => push({ type: 'success', message, timeout }), [push]);
  const error = useCallback((message: string, timeout?: number) => push({ type: 'error', message, timeout }), [push]);
  const warning = useCallback((message: string, timeout?: number) => push({ type: 'warning', message, timeout }), [push]);
  const info = useCallback((message: string, timeout?: number) => push({ type: 'info', message, timeout }), [push]);

  useEffect(() => {
    if (toasts.length && liveRef.current) {
      liveRef.current.innerText = toasts[toasts.length - 1].message;
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ push, success, error, warning, info }}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef}>
        {toasts.slice(-1).map(t => t.message)}
      </div>
      <div className="fixed z-50 top-4 right-4 space-y-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className={`rounded shadow px-4 py-3 text-sm font-medium border bg-white dark:bg-gray-800 flex items-start gap-2 transition-opacity
            ${t.type === 'success' ? 'border-green-300 text-green-800 dark:text-green-300' : ''}
            ${t.type === 'error' ? 'border-red-300 text-red-800 dark:text-red-300' : ''}
            ${t.type === 'warning' ? 'border-yellow-300 text-yellow-800 dark:text-yellow-300' : ''}
            ${t.type === 'info' ? 'border-blue-300 text-blue-800 dark:text-blue-300' : ''}`}
          >
            <span>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto text-xs opacity-70 hover:opacity-100">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
