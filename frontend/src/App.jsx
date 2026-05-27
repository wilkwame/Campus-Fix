import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/report" element={isAuthenticated ? <ReportIssue /> : <Navigate to="/login" />} />
      <Route path="/issue/:id" element={isAuthenticated ? <IssueDetail /> : <Navigate to="/login" />} />
      <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to="/login" />} />
      // Add a catch-all route at the end
<Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;