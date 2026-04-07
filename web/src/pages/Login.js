import React, { useState } from 'react';
import './App.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Changed to 8081 to match your Spring Boot port
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        
        // --- PROXY PATTERN: Session Management ---
        // We store the 'user' object so App.js knows we are authorized
        localStorage.setItem('user', JSON.stringify({ 
          loggedIn: true, 
          username: credentials.username,
          token: data.token // Your Spring Boot AuthController returns this!
        }));

        alert("Login Successful!");
        window.location.href = '/dashboard'; 
      } else {
        alert("Login Failed. Please check your institutional credentials.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Backend is unreachable. Please ensure Spring Boot is running on Port 8081.");
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
          {/* Fixed the color syntax error below */}
          <span style={{ color: 'var(--text-muted)' }}>New student? </span>
          <a href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Create an account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;