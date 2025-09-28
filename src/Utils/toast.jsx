import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast?.autoClose !== false) {
      const timer = setTimeout(onClose, toast?.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose, toast]);

  if (!toast) return null;

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500/20 backdrop-blur-md border-green-300/40 text-green-100';
      case 'error':
        return 'bg-red-500/20 backdrop-blur-md border-red-300/40 text-red-100';
      case 'warning':
        return 'bg-yellow-500/20 backdrop-blur-md border-yellow-300/40 text-yellow-100';
      case 'info':
        return 'bg-blue-500/20 backdrop-blur-md border-blue-300/40 text-blue-100';
      default:
        return 'bg-gray-500/20 backdrop-blur-md border-gray-300/40 text-gray-100';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out animate-slide-in">
      <div className={`flex items-center p-4 mb-4 rounded-lg border shadow-lg max-w-sm ${getToastStyles()}`}>
        <div className="flex items-start">
          {getIcon()}
          <div className="ml-3">
            {toast.title && (
              <div className="text-sm font-semibold">{toast.title}</div>
            )}
            <div className="text-sm">{toast.message}</div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-white/20 focus:ring-2 focus:ring-white/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const toastData = {
      message,
      type,
      title: options.title,
      duration: options.duration || 5000,
      autoClose: options.autoClose !== false,
    };
    setToast(toastData);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const contextValue = {
    showToast,
    hideToast,
    toast: {
      success: (message, options) => showToast(message, 'success', options),
      error: (message, options) => showToast(message, 'error', options),
      warning: (message, options) => showToast(message, 'warning', options),
      info: (message, options) => showToast(message, 'info', options),
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

export const LoadingOverlay = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg p-6 flex flex-col items-center space-y-4 max-w-sm mx-4 shadow-xl">
        <svg className="w-8 h-8 text-blue-300 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-white font-medium text-center">{message}</p>
      </div>
    </div>
  );
};

export const SuccessModal = ({ isOpen, title, message, onClose, showRedirectMessage = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg p-8 max-w-sm w-full mx-4 text-center transform transition-all duration-300 shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 backdrop-blur-sm border border-green-300/40 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title || "Success!"}</h3>
        <p className="text-gray-200 mb-6">{message}</p>
        {showRedirectMessage && (
          <div className="flex justify-center">
            <div className="flex items-center text-sm text-gray-300">
              <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting ...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};