import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('STAFF');
  const [expertise, setExpertise] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast(); // ← ONLY ONCE!

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // LOGIN
        const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password
        });
        
        const { user, token } = response.data;
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        showToast(`Welcome back, ${user.name}! 🎉`, 'success');
        
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        // REGISTER
        const formData = {
          staffId,
          email,
          password,
          name,
          role,
          department,
          phoneNumber: '',
          expertise: role === 'TECHNICIAN' ? expertise : null
        };
        
        const response = await axios.post(`${API_URL}/auth/register`, formData);
        const { user, token } = response.data;
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        showToast(`Account created successfully! Welcome to Campus-Fix, ${user.name}! 🎊`, 'success');
        
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Something went wrong';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Login failed';
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9ff', padding: '16px' }}>
      <div style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#00263f', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: '32px', color: 'white' }}>🔧</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#00263f' }}>Campus-Fix</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>Ho Technical University</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Staff ID *</label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="e.g., HTU2024001"
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Department *</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Engineering, IT, Administration"
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  >
                    <option value="STAFF">Staff (Teaching)</option>
                    <option value="TECHNICIAN">Technician (Electrician, Plumber, etc.)</option>
                    <option value="ADMIN">Admin/Head of Faculty</option>
                  </select>
                </div>
                
                {role === 'TECHNICIAN' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Area of Expertise *</label>
                    <select
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                      required
                    >
                      <option value="">Select expertise</option>
                      <option value="ELECTRICAL">Electrical</option>
                      <option value="PLUMBING">Plumbing</option>
                      <option value="CARPENTRY">Carpentry</option>
                      <option value="IT_NETWORK">IT/Network</option>
                      <option value="HVAC">HVAC/Air Conditioning</option>
                      <option value="CLEANING">Cleaning</option>
                      <option value="GROUNDS">Grounds/Maintenance</option>
                      <option value="SECURITY">Security</option>
                    </select>
                  </div>
                )}
              </>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@htu.edu.gh"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <small style={{ color: '#666', fontSize: '11px' }}>Must be institutional email (@htu.edu.gh)</small>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{ color: '#1a648c', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;