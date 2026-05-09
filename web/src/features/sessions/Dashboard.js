
import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newSession, setNewSession] = useState({
    topic: '', 
    location: '', 
    date: '', 
    time: '', 
    maxParticipants: 5 
  });

  const API_BASE = 'http://localhost:8081/api/sessions';

  const fetchSessions = async () => {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) { 
      console.error("Error fetching sessions:", err); 
    }
  };

  useEffect(() => { 
    fetchSessions(); 
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Updated: Pass the logged-in username as createdBy
        body: JSON.stringify({ ...newSession, createdBy: user.username })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewSession({ topic: '', location: '', date: '', time: '', maxParticipants: 5 }); 
        fetchSessions();
      }
    } catch (err) {
      alert("Backend unreachable on 8081.");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/${sessionId}`, {
        method: 'DELETE'
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

  const handleJoinSession = async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Updated: Pass the username to the backend safeguard
        body: JSON.stringify(user.username) 
      });

      if (res.ok) {
        alert("Successfully joined!");
        setSelectedSession(null);
        fetchSessions();
      } else {
        const errMsg = await res.text();
        alert(errMsg || "Join failed.");
      }
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  return (
    <div className="container" style={{ position: 'relative', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Available Study Sessions</h2>
        <button className="btn" style={{width: 'auto', padding: '10px 20px'}} onClick={() => setShowCreateModal(true)}>
          + Create Session
        </button>
      </header>

      <div className="session-grid">
        {sessions.length === 0 && <p style={{textAlign: 'center', gridColumn: '1/-1'}}>No sessions found.</p>}
        {sessions.map(session => (
          <div key={session.id} className="session-card">
            <span className="badge">{session.topic}</span>
            <h3>{session.location}</h3>
            <p>{session.date} @ {session.time}</p>
            <div className="capacity-text">
              Spots: {session.currentParticipants || 0} / {session.maxParticipants || 0}
            </div>
            <button className="btn" onClick={() => setSelectedSession(session)}>View Details</button>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" style={{display: 'flex', visibility: 'visible', opacity: 1}}>
          <div className="card modal-content" style={{zIndex: 1001, background: 'white', position: 'relative'}}>
            <h3>Create New Session</h3>
            <form onSubmit={handleCreateSession} style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'}}>
              <input type="text" placeholder="Topic" value={newSession.topic} onChange={e => setNewSession({...newSession, topic: e.target.value})} required />
              <input type="text" placeholder="Location" value={newSession.location} onChange={e => setNewSession({...newSession, location: e.target.value})} required />
              <input type="date" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} required />
              <input type="time" value={newSession.time} onChange={e => setNewSession({...newSession, time: e.target.value})} required />
              
              <label style={{fontSize: '0.8rem', color: '#666'}}>Max Participants:</label>
              <input type="number" value={newSession.maxParticipants} onChange={e => setNewSession({...newSession, maxParticipants: e.target.value})} required />
              
              <button type="submit" className="btn">Post Session</button>
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedSession && (
        <div className="modal-overlay" style={{display: 'flex'}}>
          <div className="card modal-content" style={{background: 'white', padding: '2rem'}}>
            <span className="badge" style={{marginBottom: '10px'}}>{selectedSession.topic}</span>
            <h2>Session Details</h2>
            <p><strong>Location:</strong> {selectedSession.location}</p>
            <p><strong>Schedule:</strong> {selectedSession.date} at {selectedSession.time}</p>
            <p><strong>Host:</strong> {selectedSession.createdBy}</p>
            <p style={{marginBottom: '20px'}}><strong>Capacity:</strong> {selectedSession.currentParticipants} of {selectedSession.maxParticipants} joined</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {/* Updated Join Button with all safeguards */}
                <button 
                  className="btn" 
                  disabled={
                    selectedSession.participantUsernames?.includes(user.username) || 
                    selectedSession.currentParticipants >= selectedSession.maxParticipants
                  }
                  onClick={() => handleJoinSession(selectedSession.id)}
                  style={{
                    backgroundColor: selectedSession.participantUsernames?.includes(user.username) ? '#6c757d' : '#4CAF50'
                  }}
                >
                  {selectedSession.participantUsernames?.includes(user.username) 
                    ? 'Already Joined' 
                    : selectedSession.currentParticipants >= selectedSession.maxParticipants 
                      ? 'Session Full' 
                      : 'Join This Session'}
                </button>

                {/* Only show delete if the logged-in user is the owner */}
                {selectedSession.createdBy === user.username && (
                  <button 
                    className="btn" 
                    style={{backgroundColor: '#ff4d4d'}} 
                    onClick={() => handleDeleteSession(selectedSession.id)}
                  >
                    Delete My Session
                  </button>
                )}

                <button onClick={() => setSelectedSession(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;