import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  // Get logged-in user from localStorage safely
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };
  
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // 🖼️ Updated: Includes the new imageUrl property state field
  const [newSession, setNewSession] = useState({
    topic: '', 
    location: '', 
    date: '', 
    time: '', 
    maxParticipants: 5,
    imageUrl: '' 
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
    
    // Fallback placeholder image if the user leaves the input link empty
    const fallbackImage = newSession.imageUrl.trim() || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600';

    try {
      const res = await fetch(API_BASE, {
        value: 'POST',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newSession, 
          imageUrl: fallbackImage,
          createdBy: user.username 
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewSession({ topic: '', location: '', date: '', time: '', maxParticipants: 5, imageUrl: '' }); 
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

  // --- 🧭 DATA SLICE LOGIC ---
  // Slice 1: Sessions where you are the host or listed inside the participant array
  const mySessions = sessions.filter(s => 
    s.createdBy === user.username || 
    s.participantUsernames?.includes(user.username)
  );

  // Slice 2: Public open sessions created by others that you haven't joined yet
  const availableSessions = sessions.filter(s => 
    s.createdBy !== user.username && 
    !s.participantUsernames?.includes(user.username)
  );

  // Helper function to render uniform individual cards inside sliders
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
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}
      >
        {/* Card Location Landmark Visual Header */}
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

        {/* Card Structural Details */}
        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>📍 {session.location}</h3>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>📅 {session.date} @ {session.time}</p>
          </div>
          
          <div>
            <div className="capacity-text" style={{ marginBottom: '12px', fontWeight: '600' }}>
              Spots: {session.currentParticipants || 0} / {session.maxParticipants || 0}
            </div>
            <button className="btn" style={{ marginTop: 'auto' }} onClick={() => setSelectedSession(session)}>
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0 }}>StudyConnect Workspace</h2>
          <p style={{ margin: '4px 0 0', color: '#718096' }}>Welcome back, <strong>{user.username}</strong></p>
        </div>
        <button className="btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setShowCreateModal(true)}>
          + Create Session
        </button>
      </header>

      {/* 📅 SLIDER SECTION 1: YOUR COMMITTED SESSIONS */}
      <h3 style={{ borderLeft: '4px solid #3182ce', paddingLeft: '10px', marginBottom: '15px', color: '#2d3748' }}>
        Your Active Commits ({mySessions.length})
      </h3>
      <div 
        className="slider-layout" 
        style={{ 
          display: 'flex', 
          gap: '20px', 
          overflowX: 'auto', 
          paddingBottom: '15px', 
          marginBottom: '40px',
          scrollBehavior: 'smooth'
        }}
      >
        {mySessions.length === 0 ? (
          <p style={{ color: '#a0aec0', padding: '10px' }}>You haven't created or joined any active workspace sessions yet.</p>
        ) : (
          mySessions.map(session => renderSessionCard(session))
        )}
      </div>

      {/* 🔍 SLIDER SECTION 2: AVAILABLE PUBLIC OPEN SESSIONS */}
      <h3 style={{ borderLeft: '4px solid #38a169', paddingLeft: '10px', marginBottom: '15px', color: '#2d3748' }}>
        Explore Available Hubs ({availableSessions.length})
      </h3>
      <div 
        className="slider-layout" 
        style={{ 
          display: 'flex', 
          gap: '20px', 
          overflowX: 'auto', 
          paddingBottom: '15px',
          scrollBehavior: 'smooth'
        }}
      >
        {availableSessions.length === 0 ? (
          <p style={{ color: '#a0aec0', padding: '10px' }}>No public workspaces are active right now. Consider hosting one!</p>
        ) : (
          availableSessions.map(session => renderSessionCard(session))
        )}
      </div>

      {/* --- CREATE MODAL MODIFIED WITH IMAGE URL INPUT --- */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ display: 'flex', visibility: 'visible', opacity: 1 }}>
          <div className="card modal-content" style={{ zIndex: 1001, background: 'white', position: 'relative', maxWidth: '450px', width: '100%' }}>
            <h3>Create New Session</h3>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <input type="text" placeholder="Topic / Subject" value={newSession.topic} onChange={e => setNewSession({ ...newSession, topic: e.target.value })} required />
              <input type="text" placeholder="Location Room Asset (e.g. Library Tech Room 2)" value={newSession.location} onChange={e => setNewSession({ ...newSession, location: e.target.value })} required />
              
              {/* 🖼️ Fresh Location Image Address Field Box Link */}
              <input 
                type="url" 
                placeholder="Paste Location Image URL (Optional)" 
                value={newSession.imageUrl} 
                onChange={e => setNewSession({ ...newSession, imageUrl: e.target.value })} 
              />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={newSession.date} onChange={e => setNewSession({ ...newSession, date: e.target.value })} style={{ flex: 1 }} required />
                <input type="time" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} style={{ flex: 1 }} required />
              </div>
              
              <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: '-5px' }}>Max Seats Available:</label>
              <input type="number" min="1" value={newSession.maxParticipants} onChange={e => setNewSession({ ...newSession, maxParticipants: parseInt(e.target.value) || 5 })} required />
              
              <button type="submit" className="btn">Post Session</button>
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL WITH CARD IMAGE PREVIEW */}
      {selectedSession && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="card modal-content" style={{ background: 'white', padding: '0', overflow: 'hidden', maxWidth: '500px', width: '100%' }}>
            {/* Context Header Image Banner */}
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
              <p><strong>Location:</strong> {selectedSession.location}</p>
              <p><strong>Schedule:</strong> {selectedSession.date} at {selectedSession.time}</p>
              <p><strong>Host:</strong> {selectedSession.createdBy}</p>
              <p style={{ marginBottom: '20px' }}><strong>Capacity:</strong> {selectedSession.currentParticipants} of {selectedSession.maxParticipants} joined</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn" 
                  disabled={
                    selectedSession.participantUsernames?.includes(user.username) || 
                    selectedSession.createdBy === user.username ||
                    selectedSession.currentParticipants >= selectedSession.maxParticipants
                  }
                  onClick={() => handleJoinSession(selectedSession.id)}
                  style={{
                    backgroundColor: (selectedSession.participantUsernames?.includes(user.username) || selectedSession.createdBy === user.username) ? '#6c757d' : '#4CAF50'
                  }}
                >
                  {selectedSession.createdBy === user.username
                    ? 'You are Hosting'
                    : selectedSession.participantUsernames?.includes(user.username) 
                      ? 'Already Joined' 
                      : selectedSession.currentParticipants >= selectedSession.maxParticipants 
                        ? 'Session Full' 
                        : 'Join This Session'}
                </button>

                {selectedSession.createdBy === user.username && (
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#ff4d4d' }} 
                    onClick={() => handleDeleteSession(selectedSession.id)}
                  >
                    Delete My Session
                  </button>
                )}

                <button onClick={() => setSelectedSession(null)} className="btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;