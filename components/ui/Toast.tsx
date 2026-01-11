'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import ui from '@/components/ui/ui.module.css';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
        pointerEvents: 'none',
        width: '100%',
        maxWidth: 420,
        padding: '0 16px',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const typeStyles = {
    success: {
      backgroundColor: 'var(--card-bg)',
      borderColor: '#22c55e',
      color: 'var(--text-primary)',
    },
    error: {
      backgroundColor: 'var(--card-bg)',
      borderColor: '#ef4444',
      color: 'var(--text-primary)',
    },
    info: {
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--card-border)',
      color: 'var(--text-primary)',
    },
  };

  const style = typeStyles[toast.type];

  return (
    <div
      className={ui.card}
      style={{
        ...style,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 280,
        maxWidth: 420,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
      onClick={handleRemove}
    >
      <div style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</div>
      <button
        onClick={handleRemove}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          fontSize: '18px',
          lineHeight: 1,
          opacity: 0.6,
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

