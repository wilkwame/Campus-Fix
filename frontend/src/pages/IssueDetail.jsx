import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ReportIssue() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ELECTRICAL',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate all fields
    if (!formData.title.trim()) {
      setError('Please enter a title');
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Please enter a location');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Submitting issue:', formData);
      const response = await axios.post('http://localhost:5000/api/issues', formData);
      console.log('Response:', response.data);
      alert('✅ Issue reported successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error details:', error);
      console.error('Response:', error.response);
      
      if (error.response) {
        setError(error.response.data.message || 'Server error');
        alert(`❌ Error: ${error.response.data.message}`);
      } else if (error.request) {
        setError('Cannot connect to server. Make sure backend is running on port 5000');
        alert('❌ Cannot connect to server. Please check if backend is running.');
      } else {
        setError(error.message);
        alert(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9ff' }}>
      <header style={{ backgroundColor: 'white', padding: '16px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Report Issue</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>Help us maintain our campus</p>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Issue Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Broken ceiling fan in Lecture Hall B"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
              >
                <option value="ELECTRICAL">⚡ Electrical</option>
                <option value="PLUMBING">💧 Plumbing</option>
                <option value="CARPENTRY">🔨 Carpentry</option>
                <option value="STRUCTURAL">🏗️ Structural</option>
                <option value="IT_NETWORK">📡 IT/Network</option>
                <option value="HVAC">❄️ HVAC/Air Conditioning</option>
                <option value="OTHER">📌 Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Engineering Block, Room 204"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Please provide specific details about the issue..."
                rows="5"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '14px', 
                backgroundColor: loading ? '#ccc' : '#00263f', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                cursor: loading ? 'not-allowed' : 'pointer' 
              }}
            >
              {loading ? 'Submitting...' : 'Submit Issue'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ReportIssue;