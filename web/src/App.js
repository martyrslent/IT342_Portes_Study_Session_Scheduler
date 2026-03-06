import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// --- REGISTER COMPONENT ---
const Register = () => {
  const [user, setUser] = useState({ username: '', email: '', password: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.email.endsWith("@cit.edu")) { 
      alert("Registration is restricted to students of this institution only.");
      return;
    }
    const res = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (res.ok) { 
      alert("Registration successful!"); 
      window.location.href = '/login'; 
    }
  };
  return (
    <div className="container" style={{maxWidth: '400px'}}>
      <div className="card">
        <h2>Register Page</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group"><input type="text" placeholder="Username" onChange={e => setUser({...user, username: e.target.value})} required /></div>
          <div className="input-group"><input type="email" placeholder="Institutional Email" onChange={e => setUser({...user, email: e.target.value})} required /></div>
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
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (res.ok) {
      localStorage.setItem('user', JSON.stringify({ loggedIn: true, username: credentials.username }));
      window.location.href = '/dashboard'; 
    } else { alert("Login failed."); }
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

// --- REVISED DASHBOARD COMPONENT ---
const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newSession, setNewSession] = useState({
    topic: '', location: '', date: '', time: '', maxParticipants: 5
  });

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) { console.error("Error fetching:", err); }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    });
    if (res.ok) {
      setShowCreateModal(false);
      fetchSessions();
    }
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
              <Link to="/dashboard">Dashboard</Link>
              <button className="btn" style={{width: 'auto', marginLeft: '15px'}} onClick={() => {
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