import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, faExclamationCircle, faInfoCircle, 
  faTimesCircle, faTimes, faSpinner
} from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'warning':
        return faInfoCircle;
      case 'info':
        return faInfoCircle;
      default:
        return faCheckCircle;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#10b981', text: 'white', icon: '#ffffff' };
      case 'error':
        return { bg: '#ef4444', text: 'white', icon: '#ffffff' };
      case 'warning':
        return { bg: '#f59e0b', text: 'white', icon: '#ffffff' };
      case 'info':
        return { bg: '#3b82f6', text: 'white', icon: '#ffffff' };
      default:
        return { bg: '#10b981', text: 'white', icon: '#ffffff' };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 9999,
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
      <div style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '400px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <FontAwesomeIcon icon={getIcon()} style={{ fontSize: '24px', color: colors.icon }} />
        <div style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{message}</div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default Toast;