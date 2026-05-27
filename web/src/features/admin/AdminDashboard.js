import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../../App.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // Tracks current panel tab ('users' | 'sessions')
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        if (activeTab === 'users') {
          const data = await apiService.adminGetUsers();
          setUsers(data);
        } else {
          const data = await apiService.getSessions();
          setSessions(data);
        }
      } catch (err) {
        console.error("Fetch administrative data error:", err);
        setErrorMessage(err.message || 'Failed to retrieve records from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleToggleUserStatus = async (userId) => {
    try {
      await apiService.adminToggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, active: !u.active } : u));
    } catch (err) {
      alert(err.message || 'Error updating target status configuration.');
    }
  };

  const handleModerationDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to remove this study session? This action cannot be undone.')) {
      try {
        await apiService.adminDeleteSession(sessionId);
        setSessions(sessions.filter(s => s.id !== sessionId));
      } catch (err) {
        alert(err.message || 'Error executing administrative session purge.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', margin: 0 }}>🛡️ Admin Management Panel</h1>
          <p style={{ color: 'var(--text-muted)', margin: '5px 0 0' }}>Institutional Moderation and Auditing</p>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: '#718096', width: 'auto', padding: '0.5rem 1rem' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('users')} 
          className="btn"
          style={{ backgroundColor: activeTab === 'users' ? 'var(--primary)' : '#e2e8f0', color: activeTab === 'users' ? '#fff' : '#4a5568', width: 'auto' }}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('sessions')} 
          className="btn"
          style={{ backgroundColor: activeTab === 'sessions' ? 'var(--primary)' : '#e2e8f0', color: activeTab === 'sessions' ? '#fff' : '#4a5568', width: 'auto' }}
        >
          Session Moderation
        </button>
      </div>

      {errorMessage && (
        <div style={{ color: '#ff4d4d', backgroundColor: '#ffe6e6', padding: '12px', borderRadius: '4px', marginBottom: '1.5rem' }}>
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Retrieving latest platform ledger records...</p>
      ) : (
        <div className="card" style={{ width: '100%', padding: '1.5rem', overflowX: 'auto' }}>
          {activeTab === 'users' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Student ID</th>
                  <th style={{ padding: '12px' }}>Institutional Account</th>
                  <th style={{ padding: '12px' }}>System Access Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== 'ROLE_ADMIN' && u.username !== 'admin').length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>No student records found.</td></tr>
                ) : (
                  users
                    .filter(u => u.role !== 'ROLE_ADMIN' && u.username !== 'admin')
                    .map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '12px' }}>{u.id}</td>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{u.username || u.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: u.active ? '#38a169' : '#e53e3e', fontWeight: 'bold' }}>
                            {u.active ? '🟢 Active Access' : '🔴 Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button 
                            onClick={() => handleToggleUserStatus(u.id)}
                            style={{ background: u.active ? '#e53e3e' : '#38a169', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            {u.active ? 'Block Student' : 'Unblock Access'}
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'sessions' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Topic & Description</th>
                  <th style={{ padding: '12px' }}>Location Resource</th>
                  <th style={{ padding: '12px' }}>Scheduled Date</th>
                  <th style={{ padding: '12px' }}>Cap Limit</th>
                  <th style={{ padding: '12px' }}>Auditing Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>No posted study sessions available.</td></tr>
                ) : (
                  sessions.map(s => {
                    const rawDate = s.date || s.dateTime;
                    const sessionDate = rawDate 
                      ? new Date(rawDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
                      : 'No Date Set';

                    const current = s.currentParticipants || 0;
                    const max = s.maxParticipants || 4;

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '600' }}>{s.topic || 'Untitled Session'}</div>
                        </td>
                        <td style={{ padding: '12px' }}>{s.location || 'TBD'}</td>
                        <td style={{ padding: '12px' }}>{sessionDate}</td>
                        <td style={{ padding: '12px' }}>{current} / {max}</td>
                        <td style={{ padding: '12px' }}>
                          <button 
                            onClick={() => handleModerationDelete(s.id)}
                            style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                          >
                            Purge Session
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;