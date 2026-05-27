import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faUpload, faImage, faVideo, faTimes, 
  faSpinner, faCheckCircle, faExclamationTriangle,
  faBolt, faWater, faTools, faNetworkWired, faSnowflake,
  faHardHat, faBuilding, faWrench, faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../context/ToastContext';

function ReportIssue() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ELECTRICAL',
    location: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();
  


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    // Check file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
    
    if (validImageTypes.includes(file.type)) {
      setMediaType('image');
    } else if (validVideoTypes.includes(file.type)) {
      setMediaType('video');
    } else {
      setError('Please upload an image (JPEG, PNG, GIF) or video (MP4)');
      return;
    }
    
    setMediaFile(file);
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };
// ================================
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');
  
  if (!formData.title.trim()) {
    showToast('Please enter a title for the issue', 'warning');
    setLoading(false);
    return;
  }
  if (!formData.location.trim()) {
    showToast('Please enter the location where the issue occurred', 'warning');
    setLoading(false);
    return;
  }
  if (!formData.description.trim()) {
    showToast('Please describe the issue in detail', 'warning');
    setLoading(false);
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('priority', 'MEDIUM');
    
    if (mediaFile) {
      formDataToSend.append('media', mediaFile);
      showToast('Uploading your file...', 'info', 2000);
    }
    
    const response = await axios.post('http://localhost:5000/api/issues', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    setSuccess('✅ Issue reported successfully!');
    showToast(`Issue "${formData.title}" has been reported successfully! A technician will be assigned shortly.`, 'success', 5000);
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  } catch (error) {
    console.error('Error details:', error);
    let errorMessage = 'Failed to report issue';
    
    if (error.response) {
      errorMessage = error.response.data?.message || 'Server error';
    } else if (error.request) {
      errorMessage = 'Cannot connect to server. Make sure backend is running on port 5000';
    } else {
      errorMessage = error.message;
    }
    
    showToast(errorMessage, 'error', 4000);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

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
      'OTHER': faTools
    };
    return icons[category] || faTools;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9ff' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        padding: '16px 24px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '16px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#00263f'
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </button>
      </header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#00263f' }}>
            Report Issue
          </h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Help us maintain our campus. Please provide as much detail as possible.
          </p>

          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              backgroundColor: '#d1fae5', 
              color: '#065f46', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faCheckCircle} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#00263f' }}>
                Issue Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Broken ceiling fan in Lecture Hall B"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            {/* Category Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#00263f' }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="ELECTRICAL">⚡ Electrical</option>
                <option value="PLUMBING">💧 Plumbing</option>
                <option value="CARPENTRY">🔨 Carpentry</option>
                <option value="STRUCTURAL">🏗️ Structural</option>
                <option value="IT_NETWORK">📡 IT/Network</option>
                <option value="HVAC">❄️ HVAC/Air Conditioning</option>
                <option value="CLEANING">🧹 Cleaning</option>
                <option value="GROUNDS">🌳 Grounds/Maintenance</option>
                <option value="SECURITY">🛡️ Security</option>
                <option value="OTHER">📌 Other</option>
              </select>
            </div>

            {/* Location Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#00263f' }}>
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Engineering Block, Room 204"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            {/* Description Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#00263f' }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Please provide specific details about the issue (what happened, when, any other relevant info)..."
                rows="5"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                required
              />
            </div>

            {/* Media Upload Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#00263f' }}>
                <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} />
                Add Photo or Video (Optional)
              </label>
              
              <div style={{
                border: '2px dashed #ddd',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#fafafa',
                transition: 'border-color 0.2s',
                cursor: 'pointer'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#00263f';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const fakeEvent = { target: { files: [file] } };
                  handleFileChange(fakeEvent);
                }
                e.currentTarget.style.borderColor = '#ddd';
              }}
              onClick={() => document.getElementById('mediaInput').click()}
              >
                <input
                  id="mediaInput"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                {!mediaPreview ? (
                  <div>
                    <FontAwesomeIcon icon={faUpload} style={{ fontSize: '40px', color: '#999', marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontWeight: '500' }}>Click or drag to upload</p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      Supports: JPG, PNG, GIF, MP4 (Max 10MB)
                    </p>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {mediaType === 'image' ? (
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '8px',
                          objectFit: 'contain'
                        }} 
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        controls 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '8px'
                        }} 
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMedia();
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
              </div>
              
              {mediaFile && (
                <p style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '4px' }} />
                  File ready: {mediaFile.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
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
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Submitting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} />
                  Submit Issue
                </>
              )}
            </button>
          </form>
          
          {/* Info Box */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#1a648c'
          }}>
            <strong>📌 What happens next?</strong>
            <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
              <li>Your issue will be automatically assigned to the appropriate technician</li>
              <li>You'll receive a notification when someone is assigned</li>
              <li>Track progress from your dashboard</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportIssue;