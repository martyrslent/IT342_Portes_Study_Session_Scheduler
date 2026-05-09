import React, { useState } from 'react';
import { apiService } from './services/api'; // 1. Import your Facade
import '../App.css';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Logic: Restrict to CIT students
    if (!formData.email.endsWith("@cit.edu")) { 
      alert("Registration is restricted to official CIT emails only.");
      return;
    }

    try {
      // 2. Use the Facade instead of hardcoded fetch
      const data = await apiService.register(formData);
      
      alert("Registration successful! Please login.");
      window.location.href = '/login';
      
    } catch (error) { 
      console.error("Error:", error.message);
      alert("Registration failed: " + error.message);
    }
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
            <input type="email" placeholder="student@cit.edu" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
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