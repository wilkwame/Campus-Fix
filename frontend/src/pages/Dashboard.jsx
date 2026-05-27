import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, faPlusCircle, faSignOutAlt, faBell, 
  faTools, faClipboardList, faSpinner, faCheckCircle,
  faExclamationTriangle, faMapMarkerAlt, faCalendarAlt,
  faFolderOpen, faUserCog, faChartLine, faBuilding,
  faWrench, faBolt, faWater, faNetworkWired, faSnowflake,
  faHardHat, faShieldAlt, faEnvelope, faPhone
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Dashboard({ user: propUser, onLogout }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return propUser || {};
  });
  
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchIssues();
    fetchNotifications();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`${API_URL}/issues`);
            setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };
// ===========================
  const handleLogout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
  showToast('You have been logged out successfully. See you soon! 👋', 'info');
  if (onLogout) {
    onLogout();
  } else {
    setTimeout(() => navigate('/login'), 1000);
  }
};

  const totalIssues = issues.length;
  const pendingIssues = issues.filter(i => i.status === 'PENDING').length;
  const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
  const resolvedIssues = issues.filter(i => i.status === 'RESOLVED').length;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCategoryIcon = (category) => {
    const icons = {
      'ELECTRICAL': faBolt,
      'PLUMBING': faWater,
      'CARPENTRY': faTools,
      'IT_NETWORK': faNetworkWired,
      'HVAC': faSnowflake,
      'STRUCTURAL': faHardHat,
      'SECURITY': faShieldAlt,
      'CLEANING': faWrench,
      'GROUNDS': faBuilding,
      'OTHER': faFolderOpen
    };
    return icons[category] || faTools;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return { bg: '#fef3c7', color: '#d97706', icon: faExclamationTriangle };
      case 'ASSIGNED': return { bg: '#dbeafe', color: '#1e40af', icon: faUserCog };
      case 'IN_PROGRESS': return { bg: '#dbeafe', color: '#1e40af', icon: faSpinner };
      case 'RESOLVED': return { bg: '#d1fae5', color: '#065f46', icon: faCheckCircle };
      default: return { bg: '#e5e7eb', color: '#666', icon: faClipboardList };
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9f9ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: '#00263f', marginBottom: '16px' }} />
          <div style={{ color: '#00263f' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9ff', paddingBottom: '80px' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        padding: '16px 24px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#00263f', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faTools} style={{ color: '#fdbc13', fontSize: '20px' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#00263f', margin: 0 }}>Campus-Fix</h1>
              <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Ho Technical University</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '8px',
                  fontSize: '20px'
                }}
              >
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '45px',
                  width: '350px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  zIndex: 1000
                }}>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #e5e7eb', 
                    fontWeight: 'bold',
                    backgroundColor: '#f9f9ff',
                    borderRadius: '12px 12px 0 0'
                  }}>
                    <FontAwesomeIcon icon={faBell} style={{ marginRight: '8px' }} />
                    Notifications ({notifications.length})
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                      <FontAwesomeIcon icon={faBell} style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }} />
                      <div>No notifications yet</div>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          backgroundColor: notif.isRead ? 'white' : '#eff6ff',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{notif.title}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{notif.message}</div>
                        <div style={{ fontSize: '10px', color: '#999' }}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/report')}
              style={{ 
                padding: '8px 20px', 
                backgroundColor: '#00263f', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} />
              Report Issue
            </button>
            
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                style={{ 
                  padding: '8px 20px', 
                  backgroundColor: '#fdbc13', 
                  color: '#00263f', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FontAwesomeIcon icon={faUserCog} />
                Admin Panel
              </button>
            )}
            
            <button
              onClick={handleLogout}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#e5e7eb', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome Message */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#00263f', marginBottom: '8px' }}>
            Welcome, {user?.name || 'User'}!
          </h2>
          <p style={{ color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faChartLine} />
            {user?.role === 'ADMIN' ? 'Administrator Dashboard' : 
             user?.role === 'TECHNICIAN' ? 'Technician Dashboard' : 
             'Staff Dashboard'} - Track and manage facility issues
          </p>
          {user?.expertise && (
            <p style={{ color: '#1a648c', fontSize: '14px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faTools} />
              Expertise: {user.expertise}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #00263f'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faClipboardList} style={{ color: '#00263f', fontSize: '24px' }} />
              <h3 style={{ color: '#666', fontSize: '14px', margin: 0 }}>Total Issues</h3>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#00263f', margin: 0 }}>{totalIssues}</p>
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #fdbc13'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#fdbc13', fontSize: '24px' }} />
              <h3 style={{ color: '#666', fontSize: '14px', margin: 0 }}>Pending</h3>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#fdbc13', margin: 0 }}>{pendingIssues}</p>
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #1a648c'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faSpinner} style={{ color: '#1a648c', fontSize: '24px' }} />
              <h3 style={{ color: '#666', fontSize: '14px', margin: 0 }}>In Progress</h3>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a648c', margin: 0 }}>{inProgressIssues}</p>
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981', fontSize: '24px' }} />
              <h3 style={{ color: '#666', fontSize: '14px', margin: 0 }}>Resolved</h3>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{resolvedIssues}</p>
          </div>
        </div>

        {/* Issues List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#00263f' }}>
            <FontAwesomeIcon icon={faClipboardList} style={{ marginRight: '8px' }} />
            Recent Issues
          </h2>
          <button 
            onClick={() => navigate('/report')}
            style={{ color: '#1a648c', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            View All →
          </button>
        </div>
        
        {issues.length === 0 ? (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '60px 48px', 
            borderRadius: '12px', 
            textAlign: 'center', 
            color: '#666',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No Issues Yet</h3>
            <p>Click "Report Issue" to create your first maintenance request.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {issues.slice(0, 5).map(issue => {
              const statusStyle = getStatusColor(issue.status);
              return (
                <div 
                  key={issue.id} 
                  onClick={() => navigate(`/issue/${issue.id}`)}
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, boxShadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <FontAwesomeIcon icon={getCategoryIcon(issue.category)} style={{ color: '#00263f' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{issue.title}</h3>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FontAwesomeIcon icon={statusStyle.icon} size="xs" />
                          {issue.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} size="xs" />
                        {issue.location}
                      </p>
                      <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
                        {issue.description?.substring(0, 120)}...
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FontAwesomeIcon icon={faFolderOpen} size="xs" /> {issue.category}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FontAwesomeIcon icon={faCalendarAlt} size="xs" /> {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '20px', color: '#ccc', marginLeft: '12px' }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'white', 
        display: 'flex', 
        justifyContent: 'space-around', 
        padding: '12px 16px', 
        boxShadow: '0 -4px 6px rgba(0,0,0,0.05)',
        zIndex: 100
      }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            textAlign: 'center', 
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#f0f3ff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <FontAwesomeIcon icon={faTachometerAlt} style={{ fontSize: '20px' }} />
          <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Dashboard</div>
        </button>
        <button 
          onClick={() => navigate('/report')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            textAlign: 'center', 
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <FontAwesomeIcon icon={faPlusCircle} style={{ fontSize: '20px' }} />
          <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Report</div>
        </button>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => navigate('/admin')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              textAlign: 'center', 
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FontAwesomeIcon icon={faUserCog} style={{ fontSize: '20px' }} />
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Admin</div>
          </button>
        )}
      </nav>
    </div>
  );
}

export default Dashboard;