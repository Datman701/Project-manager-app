import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const getToastStyles = (type) => {
    const baseStyles = "px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-80 max-w-md";

    const typeStyles = {
      success: "bg-green-100 text-green-800 border border-green-200",
      error: "bg-red-100 text-red-800 border border-red-200",
      warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      info: "bg-blue-100 text-blue-800 border border-blue-200"
    };

    return `${baseStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  const getIcon = (type) => {
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ"
    };
    return icons[type] || icons.info;
  };

  return (
    <div className={getToastStyles(toast.type)}>
      <div className="flex items-center">
        <span className="text-lg mr-3">{getIcon(toast.type)}</span>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <button
        onClick={onRemove}
        className="ml-4 text-lg hover:opacity-70 transition-opacity"
        aria-label="Close toast"
      >
        ×
      </button>
    </div>
  );
};
