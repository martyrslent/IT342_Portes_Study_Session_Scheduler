import React, { useState } from 'react';
import './App.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (response.ok) {
      // Logic: Store user session or token if your Spring Boot backend returns one
      alert("Login Successful!");
      window.location.href = '/dashboard'; 
    } else {
      alert("Login Failed. Please check your institutional credentials.");
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '2rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to join your school's study sessions.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              onChange={(e) => setCredentials({...credentials, username: e.target.value})} 
              required
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
              required
            />
          </div>

          <button type="submit" className="btn">Sign In</button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: var(--text-muted) }}>New student? </span>
          <a href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Create an account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;