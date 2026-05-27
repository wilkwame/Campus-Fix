import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Simple toast component inline to avoid import issues
  const ToastComponent = ({ message, type, onClose }) => {
    const colors = {
      success: { bg: '#10b981', icon: '✅' },
      error: { bg: '#ef4444', icon: '❌' },
      warning: { bg: '#f59e0b', icon: '⚠️' },
      info: { bg: '#3b82f6', icon: 'ℹ️' }
    };
    
    const color = colors[type] || colors.success;
    
    return (
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <div style={{
          backgroundColor: color.bg,
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '280px',
          maxWidth: '400px'
        }}>
          <span style={{ fontSize: '24px' }}>{color.icon}</span>
          <div style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{message}</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <ToastComponent
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};