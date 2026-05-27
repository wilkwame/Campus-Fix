import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

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
        axios.get('/api/admin/stats'),
        axios.get('/api/issues'),
        axios.get('/api/admin/technicians')
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
      await axios.post(`/api/issues/${issueId}/reassign`, { technicianId });
      alert('Issue reassigned successfully');
      fetchData();
    } catch (error) {
      alert('Failed to reassign');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;

  // Chart data
  const categoryData = {
    labels: stats?.charts.byCategory.map(c => c.category),
    datasets: [{
      data: stats?.charts.byCategory.map(c => c._count),
      backgroundColor: ['#00263f', '#1a648c', '#fdbc13', '#dc2626', '#10b981', '#8b5cf6', '#ec489a'],
    }]
  };

  const priorityData = {
    labels: stats?.charts.byPriority.map(p => p.priority),
    datasets: [{
      label: 'Issues by Priority',
      data: stats?.charts.byPriority.map(p => p._count),
      backgroundColor: '#00263f',
    }]
  };

  const monthlyData = {
    labels: stats?.charts.byMonth.map(m => m.month),
    datasets: [{
      label: 'Issues Reported',
      data: stats?.charts.byMonth.map(m => m.count),
      borderColor: '#00263f',
      backgroundColor: 'rgba(0, 38, 63, 0.1)',
      fill: true,
    }]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9ff' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#00263f', color: 'white', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Dashboard</h1>
            <p style={{ opacity: 0.8, marginTop: '4px' }}>Institutional Fault Report Management</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ backgroundColor: 'white', color: '#00263f', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#666', fontSize: '14px' }}>Total Issues</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#00263f' }}>{stats?.overview.total}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#666', fontSize: '14px' }}>Pending</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#fdbc13' }}>{stats?.overview.pending}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#666', fontSize: '14px' }}>In Progress</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a648c' }}>{stats?.overview.inProgress}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#666', fontSize: '14px' }}>Resolved</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{stats?.overview.resolved}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Issues by Category</h3>
            <div style={{ height: '300px' }}>
              <Pie data={categoryData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Issues by Priority</h3>
            <div style={{ height: '300px' }}>
              <Bar data={priorityData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Monthly Issue Trend (Last 6 Months)</h3>
          <div style={{ height: '300px' }}>
            <Line data={monthlyData} options={{ maintainAspectRatio: false }} />
          </div>
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
            <p><strong>📊 Key Insights:</strong></p>
            <p>✓ Completion Rate: <strong>{stats?.overview.completionRate}%</strong></p>
            <p>✓ Average Resolution Time: <strong>{stats?.charts.avgResolutionDays} days</strong></p>
          </div>
        </div>

        {/* Pending Issues Table */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Pending Assignments</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Current Status</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.filter(i => i.status === 'PENDING' || i.status === 'REJECTED').map(issue => (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{issue.id.slice(-6)}</td>
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