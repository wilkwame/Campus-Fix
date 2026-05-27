import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faClipboardList, faTools, faUsers, 
  faCheckCircle, faExclamationTriangle, faSpinner,
  faArrowLeft, faUserCog, faWrench, faBuilding
} from '@fortawesome/free-solid-svg-icons';

// IMPORTANT: Add this line for API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const [statsRes, issuesRes, techsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`),
        axios.get(`${API_URL}/issues`),
        axios.get(`${API_URL}/admin/technicians`)
      ]);
      
      setStats(statsRes.data);
      setIssues(issuesRes.data);
      setTechnicians(techsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reassignIssue = async (issueId, technicianId) => {
    try {
      await axios.post(`${API_URL}/issues/${issueId}/reassign`, { technicianId });
      alert('Issue reassigned successfully');
      fetchData();
    } catch (error) {
      alert('Failed to reassign');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9ff' }}>
        <div style={{ textAlign: 'center' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: '#00263f' }} />
          <p style={{ marginTop: '16px', color: '#00263f' }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9ff' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#00263f', color: 'white', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FontAwesomeIcon icon={faUserCog} />
              Admin Dashboard
            </h1>
            <p style={{ opacity: 0.8, marginTop: '4px' }}>Institutional Fault Report Management</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ backgroundColor: 'white', color: '#00263f', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #00263f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faClipboardList} style={{ color: '#00263f', fontSize: '24px' }} />
              <h3 style={{ color: '#666', fontSize: '14px', margin: 0 }}>Total Issues</h3>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#00263f', margin: 0 }}>{stats?.overview?.total || 0}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #fdbc13' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#fdbc13', fontSize: '24px' }} />
              <h3 style={{ color: '#666', fontSize: '14px', margin: 0 }}>Pending</h3>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#fdbc13', margin: 0 }}>{stats?.overview?.pending || 0}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faSpinner} style={{ color: '#3b82f6', fontSize: '24px' }} />
              <h3 style={{ color: '#666', fontSize: '14px', margin: 0 }}>In Progress</h3>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{stats?.overview?.inProgress || 0}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981', fontSize: '24px' }} />
              <h3 style={{ color: '#666', fontSize: '14px', margin: 0 }}>Resolved</h3>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{stats?.overview?.resolved || 0}</p>
          </div>
        </div>

        {/* Pending Issues Table */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faTools} />
            Pending Assignments
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.filter(i => i.status === 'PENDING' || i.status === 'REJECTED').map(issue => (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{issue.id?.slice(-6) || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{issue.title}</td>
                    <td style={{ padding: '12px' }}>{issue.category}</td>
                    <td style={{ padding: '12px' }}>{issue.location}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        backgroundColor: issue.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                        color: issue.status === 'PENDING' ? '#d97706' : '#dc2626'
                      }}>
                        {issue.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        onChange={(e) => reassignIssue(issue.id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign to...</option>
                        {technicians.filter(t => t.expertise === issue.category).map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name} ({tech.expertise})</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;