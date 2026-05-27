import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, faPlusCircle, faUserCog, 
  faClipboardList, faBell, faUser 
} from '@fortawesome/free-solid-svg-icons';

function MobileNav({ unreadCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 16px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      borderTop: '1px solid #e5e7eb'
    }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          color: isActive('/dashboard') ? '#00263f' : '#9ca3af'
        }}
      >
        <FontAwesomeIcon icon={faTachometerAlt} style={{ fontSize: '22px' }} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/dashboard') ? 'bold' : 'normal' }}>Home</span>
      </button>
      
      <button
        onClick={() => navigate('/report')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          color: isActive('/report') ? '#00263f' : '#9ca3af'
        }}
      >
        <FontAwesomeIcon icon={faPlusCircle} style={{ fontSize: '22px' }} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/report') ? 'bold' : 'normal' }}>Report</span>
      </button>
      
      <button
        onClick={() => navigate('/issues')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          color: isActive('/issues') ? '#00263f' : '#9ca3af'
        }}
      >
        <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: '22px' }} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/issues') ? 'bold' : 'normal' }}>Issues</span>
      </button>
      
      <button
        onClick={() => navigate('/notifications')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          position: 'relative',
          color: isActive('/notifications') ? '#00263f' : '#9ca3af'
        }}
      >
        <FontAwesomeIcon icon={faBell} style={{ fontSize: '22px' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '20%',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
        <span style={{ fontSize: '11px', fontWeight: isActive('/notifications') ? 'bold' : 'normal' }}>Alerts</span>
      </button>
      
      <button
        onClick={() => navigate('/profile')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          color: isActive('/profile') ? '#00263f' : '#9ca3af'
        }}
      >
        <FontAwesomeIcon icon={faUser} style={{ fontSize: '22px' }} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/profile') ? 'bold' : 'normal' }}>Profile</span>
      </button>
    </nav>
  );
}

export default MobileNav;