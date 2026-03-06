import React, { useState } from 'react';
import './App.css';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logic: Restrict to students of the institution
    if (!formData.email.endsWith("@yourinstitution.edu")) {
      alert("Registration is restricted to official school emails only.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("Registration successful! Please login.");
        window.location.href = '/login';
      }
    } catch (error) { console.error("Error:", error); }
  };

  return (
    <div className="container" style={{maxWidth: '400px'}}>
      <div className="card">
        <h2>Join StudyConnect</h2>
        <p>Enter your institutional email to begin.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
          </div>
          <div className="input-group">
            <input type="email" placeholder="school@yourinstitution.edu" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn">Create Account</button>
        </form>
      </div>
    </div>
  );
};
export default Register;