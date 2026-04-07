import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSession, setNewSession] = useState({
    topic: '', location: '', date: '', time: '', maxLimit: 5
  });

  // Updated to Port 8081
  const API_BASE = 'http://localhost:8081/api/sessions';

  const fetchSessions = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setSessions(data);
    } catch (err) { 
      console.error("Error fetching sessions:", err); 
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchSessions(); // Refresh list after creating
      }
    } catch (err) {
      alert("Backend unreachable on 8081.");
    }
  };

  // NEW: Logic to "Join" a session (increments participant count)
  const handleJoinSession = async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/join`, {
        method: 'POST'
      });
      if (res.ok) {
        alert("Successfully joined the session!");
        setSelectedSession(null);
        fetchSessions(); // Refresh list to see updated count
      }
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  return (
    <div className="container" style={{ position: 'relative', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Available Study Sessions</h2>
        <button 
          className="btn" 
          style={{width: 'auto', padding: '10px 20px'}} 
          onClick={() => setShowCreateModal(true)}
        >
          + Create Session
        </button>
      </header>

      {/* --- SESSION GRID --- */}
      <div className="session-grid">
        {sessions.length === 0 && <p style={{textAlign: 'center', gridColumn: '1/-1'}}>No sessions found. Be the first to create one!</p>}
        {sessions.map(session => (
          <div key={session.id} className="session-card">
            <span className="badge">{session.topic}</span>
            <h3>{session.location}</h3>
            <p>{session.date} @ {session.time}</p>
            <div className="capacity-text">
              Spots: {session.currentParticipants || 0} / {session.maxLimit || 5}
            </div>
            <button className="btn" onClick={() => setSelectedSession(session)}>View Details</button>
          </div>
        ))}
      </div>

      {/* --- CREATE SESSION MODAL --- */}
      {showCreateModal && (
        <div className="modal-overlay" style={{display: 'flex', visibility: 'visible', opacity: 1}}>
          <div className="card modal-content" style={{zIndex: 1001, background: 'white', position: 'relative'}}>
            <h3>Create New Session</h3>
            <form onSubmit={handleCreateSession} style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'}}>
              <input type="text" placeholder="Topic" onChange={e => setNewSession({...newSession, topic: e.target.value})} required />
              <input type="text" placeholder="Location" onChange={e => setNewSession({...newSession, location: e.target.value})} required />
              <input type="date" onChange={e => setNewSession({...newSession, date: e.target.value})} required />
              <input type="time" onChange={e => setNewSession({...newSession, time: e.target.value})} required />
              <input type="number" placeholder="Max Participants" onChange={e => setNewSession({...newSession, maxLimit: e.target.value})} required />
              <button type="submit" className="btn">Post Session</button>
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary" style={{marginTop: '5px'}}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* --- SESSION DETAIL VIEW --- */}
      {selectedSession && (
        <div className="modal-overlay" style={{display: 'flex'}}>
          <div className="card modal-content" style={{background: 'white', padding: '2rem'}}>
            <span className="badge" style={{marginBottom: '10px'}}>{selectedSession.topic}</span>
            <h2>Session Details</h2>
            <p><strong>Location:</strong> {selectedSession.location}</p>
            <p><strong>Schedule:</strong> {selectedSession.date} at {selectedSession.time}</p>
            <p style={{marginBottom: '20px'}}><strong>Capacity:</strong> {selectedSession.currentParticipants || 0} of {selectedSession.maxLimit} joined</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <button 
                className="btn" 
                disabled={selectedSession.currentParticipants >= selectedSession.maxLimit}
                onClick={() => handleJoinSession(selectedSession.id)}
                >
                {selectedSession.currentParticipants >= selectedSession.maxLimit ? 'Session Full' : 'Join This Session'}
                </button>
                <button onClick={() => setSelectedSession(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;