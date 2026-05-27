// src/features/auth/Login.js
import React, { useState } from 'react';
import { apiService } from '../../services/api';
import './App.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      // 1. Fire authentication request using our API Service Facade
      // maps to POST http://localhost:8081/api/auth/login
      const data = await apiService.login({
        username: credentials.username,
        password: credentials.password
      });

      if (data && data.token) {
        // Fallback or explicit role mapping from backend payload
        const userRole = data.role || 'ROLE_STUDENT';

        // 2. Separate variable token storage for apiService wrapper automatic interceptor
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', userRole);

        // 3. --- PROXY PATTERN: Session Management ---
        // Retaining your custom layout structure for App.js tracking integrity
        localStorage.setItem('user', JSON.stringify({ 
          loggedIn: true, 
          username: credentials.username,
          token: data.token,
          role: userRole
        }));

        alert("Login Successful!");

        // 4. Dynamic routing branches based on role criteria
        if (userRole === 'ROLE_ADMIN') {
          window.location.href = '/admin'; 
        } else {
          window.location.href = '/dashboard'; 
        }
      } else {
        setErrorMsg("Login Failed. Missing credentials payload.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setErrorMsg(error.message || "Backend is unreachable. Please ensure Spring Boot is running on Port 8081.");
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '2rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to join your school's study sessions.</p>
        </div>

        {errorMsg && (
          <div style={{ color: '#ff4d4d', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})} 
              required
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
              required
            />
          </div>

          <button type="submit" className="btn">Sign In</button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>New student? </span>
          <a href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Create an account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;