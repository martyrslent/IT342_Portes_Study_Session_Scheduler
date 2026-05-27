// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { apiService } from './services/api';
import AdminDashboard from './features/admin/AdminDashboard';
import './App.css';

// --- REGISTER COMPONENT ---
const Register = () => {
  const [user, setUser] = useState({ username: '', email: '', password: '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.email.endsWith("@cit.edu")) { 
      alert("Registration is restricted to @cit.edu emails only.");
      return;
    }
    try {
      await apiService.register(user);
      alert("Registration successful! Please login."); 
      window.location.href = '/login'; 
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <div className="container" style={{maxWidth: '400px'}}>
      <div className="card">
        <h2>Register Page</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" placeholder="Username" onChange={e => setUser({...user, username: e.target.value})} required />
          </div>
          <div className="input-group">
            <input type="email" placeholder="student@cit.edu" onChange={e => setUser({...user, email: e.target.value})} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" onChange={e => setUser({...user, password: e.target.value})} required />
          </div>
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
      const data = await apiService.login(credentials);
      const userRole = data.role || 'ROLE_STUDENT';
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify({ 
        loggedIn: true, 
        username: credentials.username,
        token: data.token,
        role: userRole
      }));

      alert("Login Successful!");
      
      if (userRole === 'ROLE_ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard'; 
      }
    } catch (error) {
      alert(error.message || "Login failed. Check your institutional credentials.");
    }
  };

  return (
    <div className="container" style={{maxWidth: '400px'}}>
      <div className="card">
        <h2>Login Page</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input type="text" placeholder="Username" onChange={e => setCredentials({...credentials, username: e.target.value})} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" onChange={e => setCredentials({...credentials, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn">Login</button>
        </form>
      </div>
    </div>
  );
};

// --- MODERN SLIDER DASHBOARD COMPONENT ---
const Dashboard = () => {
  const cachedUser = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' }; 
  const [sessions, setSessions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // 🖼️ Track image links for visual map cards
  const [newSession, setNewSession] = useState({
    topic: '', location: '', date: '', time: '', maxParticipants: 5, imageUrl: ''
  });

  const fetchSessions = async () => {
    try {
      const data = await apiService.getSessions();
      setSessions(data || []);
    } catch (err) { 
      console.error("Error fetching sessions:", err); 
    }
  };

  useEffect(() => { 
    fetchSessions(); 
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const fallbackImage = newSession.imageUrl.trim() || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600';

    try {
      await apiService.createSession({ 
        ...newSession, 
        imageUrl: fallbackImage,
        createdBy: cachedUser.username 
      });
      setShowCreateModal(false);
      setNewSession({ topic: '', location: '', date: '', time: '', maxParticipants: 5, imageUrl: '' }); 
      fetchSessions();
    } catch (err) { 
      alert(err.message || "Error creating session."); 
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:8081/api/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cachedUser.username) 
      });
      if (res.ok) {
        alert("Successfully joined the session!");
        setSelectedSession(null); 
        fetchSessions(); 
      } else {
        const msg = await res.text();
        alert(msg || "Could not join session.");
      }
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete your session?")) return;
    try {
      const res = await fetch(`http://localhost:8081/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        alert("Session deleted successfully.");
        setSelectedSession(null);
        fetchSessions();
      }
    } catch (err) { 
      console.error("Delete failed:", err); 
    }
  };

  // --- 🧭 DATA SLICE LOGIC ---
  const mySessions = sessions.filter(s => 
    s.createdBy === cachedUser.username || 
    s.participantUsernames?.includes(cachedUser.username)
  );

  const availableSessions = sessions.filter(s => 
    s.createdBy !== cachedUser.username && 
    !s.participantUsernames?.includes(cachedUser.username)
  );

  const renderSessionCard = (session) => {
    const cardImg = session.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600';
    return (
      <div 
        key={session.id} 
        className="session-card" 
        style={{ 
          minWidth: '300px', 
          maxWidth: '300px', 
          padding: 0, 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          background: '#fff'
        }}
      >
        <div style={{ position: 'relative', height: '140px', width: '100%', background: '#e2e8f0' }}>
          <img 
            src={cardImg} 
            alt={session.topic} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600'; }}
          />
          <span className="badge" style={{ position: 'absolute', top: '10px', left: '10px', margin: 0, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff' }}>
            {session.topic}
          </span>
        </div>

        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#1a202c' }}>📍 {session.location}</h3>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>📅 {session.date} @ {session.time}</p>
          </div>
          
          <div>
            <div className="capacity-text" style={{ marginBottom: '12px', fontWeight: '600', color: '#4a5568' }}>
              Spots: {session.currentParticipants || 0} / {session.maxParticipants}
            </div>
            <button className="btn" style={{ marginTop: 'auto', width: '100%' }} onClick={() => setSelectedSession(session)}>
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
          <h2 style={{ margin: 0 }}>StudyConnect Workspace</h2>
          <p style={{ margin: '4px 0 0', color: '#718096' }}>Welcome back, <strong>{cachedUser.username}</strong></p>
        </div>
        <button className="btn" style={{width: 'auto'}} onClick={() => setShowCreateModal(true)}>
          + Create Session
        </button>
      </header>
      
      {/* 📅 SLIDER 1: YOUR ACTIVE SCHEDULE */}
      <h3 style={{ borderLeft: '4px solid #3182ce', paddingLeft: '10px', marginBottom: '15px', color: '#2d3748' }}>
        Your Active Schedules ({mySessions.length})
      </h3>
      <div className="slider-layout" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '40px', scrollBehavior: 'smooth' }}>
        {mySessions.length === 0 ? (
          <p style={{ color: '#a0aec0', padding: '10px' }}>You haven't created or joined any active workspace sessions yet.</p>
        ) : (
          mySessions.map(session => renderSessionCard(session))
        )}
      </div>

      {/* 🔍 SLIDER 2: EXPLORATION DISCOVERY */}
      <h3 style={{ borderLeft: '4px solid #38a169', paddingLeft: '10px', marginBottom: '15px', color: '#2d3748' }}>
        Explore Available Studies ({availableSessions.length})
      </h3>
      <div className="slider-layout" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', scrollBehavior: 'smooth' }}>
        {availableSessions.length === 0 ? (
          <p style={{ color: '#a0aec0', padding: '10px' }}>No public workspaces are active right now. Consider hosting one!</p>
        ) : (
          availableSessions.map(session => renderSessionCard(session))
        )}
      </div>

      {/* MODAL: CREATE SESSION */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ display: 'flex', visibility: 'visible', opacity: 1 }}>
          <div className="card modal-content" style={{ zIndex: 1001, background: 'white', position: 'relative', maxWidth: '450px', width: '100%' }}>
            <h3>Create New Session</h3>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <input type="text" placeholder="Topic / Subject" value={newSession.topic} onChange={e => setNewSession({ ...newSession, topic: e.target.value })} required />
              <input type="text" placeholder="Location Room Asset (e.g. Library Tech Room 2)" value={newSession.location} onChange={e => setNewSession({ ...newSession, location: e.target.value })} required />
              <input type="url" placeholder="Paste Location Image URL (Optional)" value={newSession.imageUrl} onChange={e => setNewSession({ ...newSession, imageUrl: e.target.value })} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={newSession.date} onChange={e => setNewSession({ ...newSession, date: e.target.value })} style={{ flex: 1 }} required />
                <input type="time" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} style={{ flex: 1 }} required />
              </div>
              
              <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: '-5px' }}>Max Seats:</label>
              <input type="number" min="1" value={newSession.maxParticipants} onChange={e => setNewSession({ ...newSession, maxParticipants: parseInt(e.target.value) || 5 })} required />
              
              <button type="submit" className="btn">Post Session</button>
              <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAILS VIEW */}
      {selectedSession && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="card modal-content" style={{ background: 'white', padding: '0', overflow: 'hidden', maxWidth: '500px', width: '100%' }}>
            <div style={{ width: '100%', height: '180px', background: '#cbd5e0' }}>
              <img 
                src={selectedSession.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600'} 
                alt="Details header" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            
            <div style={{ padding: '2rem' }}>
              <span className="badge" style={{ marginBottom: '10px' }}>{selectedSession.topic}</span>
              <h2>Session Workspace</h2>
              <p><strong>Where:</strong> {selectedSession.location}</p>
              <p><strong>When:</strong> {selectedSession.date} at {selectedSession.time}</p>
              <p><strong>Host:</strong> {selectedSession.createdBy || 'Unknown'}</p>
              <p style={{ marginBottom: '20px' }}><strong>Capacity:</strong> {selectedSession.currentParticipants || 0} of {selectedSession.maxParticipants} joined</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn" 
                  disabled={
                    selectedSession.participantUsernames?.includes(cachedUser.username) || 
                    selectedSession.createdBy === cachedUser.username ||
                    (selectedSession.currentParticipants >= selectedSession.maxParticipants)
                  }
                  onClick={() => handleJoinSession(selectedSession.id)}
                  style={{
                    backgroundColor: (selectedSession.participantUsernames?.includes(cachedUser.username) || selectedSession.createdBy === cachedUser.username) ? '#6c757d' : '#4CAF50'
                  }}
                >
                  {selectedSession.createdBy === cachedUser.username
                    ? 'You are Hosting'
                    : selectedSession.participantUsernames?.includes(cachedUser.username) 
                      ? 'Already Joined' 
                      : selectedSession.currentParticipants >= selectedSession.maxParticipants 
                        ? 'Session Full' 
                        : 'Join This Session'}
                </button>

                {selectedSession.createdBy === cachedUser.username && (
                  <button className="btn" style={{ backgroundColor: '#ff4d4d' }} onClick={() => handleDeleteSession(selectedSession.id)}>
                    Delete My Session
                  </button>
                )}
                <button className="btn-secondary" onClick={() => setSelectedSession(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APPLICATION BOOT CONTAINER ---
function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = localStorage.getItem('role');

  const handleLogoutAction = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <Router>
      <nav className="navbar">

  <Link to="/" className="logo">
    StudyConnect
  </Link>

  <div className="nav-actions">

    {!user ? (
      <>
        <Link to="/login" className="nav-btn login-btn">
          Login
        </Link>

        <Link to="/register" className="nav-btn register-btn">
          Register
        </Link>
      </>
    ) : (
      <button
        className="logout-btn"
        onClick={handleLogoutAction}
      >
        Logout
      </button>
    )}

  </div>

</nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={user && userRole !== 'ROLE_ADMIN' ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user && userRole === 'ROLE_ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={user ? (userRole === 'ROLE_ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;