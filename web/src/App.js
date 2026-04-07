import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// SINGLETON CONFIGURATION: Change this once, it updates the whole app.
const API_BASE_URL = 'http://localhost:8081/api';

// --- REGISTER COMPONENT ---
const Register = () => {
  const [user, setUser] = useState({ username: '', email: '', password: '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Logic: Restrict to CIT institution
    if (!user.email.endsWith("@cit.edu")) { 
      alert("Registration is restricted to @cit.edu emails only.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (res.ok) { 
        alert("Registration successful! Please login."); 
        window.location.href = '/login'; 
      } else {
        const errData = await res.json();
        alert("Registration failed: " + (errData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the Backend. Ensure Spring Boot is running on 8081.");
    }
  };

  return (
    <div className="container" style={{maxWidth: '400px'}}>
      <div className="card">
        <h2>Register Page</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group"><input type="text" placeholder="Username" onChange={e => setUser({...user, username: e.target.value})} required /></div>
          <div className="input-group"><input type="email" placeholder="student@cit.edu" onChange={e => setUser({...user, email: e.target.value})} required /></div>
          <div className="input-group"><input type="password" placeholder="Password" onChange={e => setUser({...user, password: e.target.value})} required /></div>
          <button type="submit" className="btn">Register</button>
        </form>
      </div>
    </div>
  );
};

// --- LOGIN COMPONENT ---
const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (res.ok) {
        const data = await res.json();
        // Store session in localStorage (Proxy Pattern for Session Management)
        localStorage.setItem('user', JSON.stringify({ 
          loggedIn: true, 
          username: credentials.username,
          token: data.token 
        }));
        window.location.href = '/dashboard'; 
      } else { 
        alert("Login failed. Check your credentials."); 
      }
    } catch (error) {
      alert("Backend is unreachable. Check Port 8081.");
    }
  };

  return (
    <div className="container" style={{maxWidth: '400px'}}>
      <div className="card">
        <h2>Login Page</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group"><input type="text" placeholder="Username" onChange={e => setCredentials({...credentials, username: e.target.value})} required /></div>
          <div className="input-group"><input type="password" placeholder="Password" onChange={e => setCredentials({...credentials, password: e.target.value})} required /></div>
          <button type="submit" className="btn">Login</button>
        </form>
      </div>
    </div>
  );
};

// --- DASHBOARD COMPONENT ---
const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newSession, setNewSession] = useState({
    topic: '', location: '', date: '', time: '', maxParticipants: 5
  });

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) { console.error("Error fetching sessions:", err); }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchSessions();
      }
    } catch (err) { alert("Error creating session."); }
  };

  return (
    <div className="container">
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h2>Available Study Sessions</h2>
        <button className="btn" style={{width: 'auto'}} onClick={() => setShowCreateModal(true)}>
          + Create Session
        </button>
      </header>
      
      <div className="session-grid">
        {sessions.map(session => (
          <div key={session.id} className="session-card">
            <span className="badge">{session.topic}</span>
            <h3>{session.location}</h3>
            <p>{session.date} at {session.time}</p>
            <div className="capacity-text">
              Capacity: {session.currentParticipants || 0} / {session.maxParticipants}
            </div>
            <button className="btn" onClick={() => setSelectedSession(session)}>View Details</button>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <h3>Create New Session</h3>
            <form onSubmit={handleCreateSession}>
              <div className="input-group"><input type="text" placeholder="Topic" onChange={e => setNewSession({...newSession, topic: e.target.value})} required /></div>
              <div className="input-group"><input type="text" placeholder="Location" onChange={e => setNewSession({...newSession, location: e.target.value})} required /></div>
              <div className="input-group"><input type="date" onChange={e => setNewSession({...newSession, date: e.target.value})} required /></div>
              <div className="input-group"><input type="time" onChange={e => setNewSession({...newSession, time: e.target.value})} required /></div>
              <div className="input-group"><input type="number" placeholder="Max Participants" onChange={e => setNewSession({...newSession, maxParticipants: e.target.value})} required /></div>
              <button type="submit" className="btn">Post Session</button>
              <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <h2>{selectedSession.topic}</h2>
            <p><strong>Where:</strong> {selectedSession.location}</p>
            <p><strong>When:</strong> {selectedSession.date} at {selectedSession.time}</p>
            <p><strong>Spots:</strong> {selectedSession.currentParticipants} / {selectedSession.maxParticipants}</p>
            <button className="btn" onClick={() => setSelectedSession(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">StudyConnect</Link>
        <div className="nav-links">
          {!user ? (
            <>
              <Link to="/login" style={{marginRight: '15px'}}>Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={{marginRight: '15px'}}>Dashboard</Link>
              <button className="btn" style={{width: 'auto'}} onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;