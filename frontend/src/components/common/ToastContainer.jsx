import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectToasts, removeToast } from '../../store/slices/uiSlice.js';

const ToastContainer = () => {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch();

  useEffect(() => {
    // Auto-remove toasts after duration
    toasts.forEach((toast) => {
      if (toast.duration > 0) {
        const timeElapsed = Date.now() - toast.timestamp;
        const remainingTime = toast.duration - timeElapsed;

        if (remainingTime > 0) {
          setTimeout(() => {
            dispatch(removeToast(toast.id));
          }, remainingTime);
        } else {
          // Remove immediately if duration has passed
          dispatch(removeToast(toast.id));
        }
      }
    });
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const getToastStyles = (type) => {
    const baseStyles = "px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-80 max-w-md transform transition-all duration-300 ease-in-out";

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
        <span className="text-lg mr-3 font-semibold">{getIcon(toast.type)}</span>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <button
        onClick={onRemove}
        className="ml-4 text-lg hover:opacity-70 transition-opacity focus:outline-none"
        aria-label="Close toast"
      >
        ×
      </button>
    </div>
  );
};

export default ToastContainer;
