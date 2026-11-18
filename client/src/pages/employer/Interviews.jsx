import React, { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews/my');
      if (res.success && res.data) {
        setInterviews(res.data);
      }
    } catch (err) {
      console.warn('Error fetching interviews:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleStatusChange = async (interviewId, newStatus) => {
    try {
      const res = await api.patch(`/interviews/${interviewId}`, { status: newStatus });
      if (res.success) {
        setInterviews((prev) =>
          prev.map((i) => (i._id === interviewId ? { ...i, status: newStatus } : i))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update interview');
    }
  };

  if (loading) return <Loader message="Loading scheduled interviews..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Scheduled Interviews
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Manage upcoming video calls, in-person discussions, and interview statuses with candidates.
          </p>
        </div>

        {interviews.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No interviews scheduled yet"
            description="When you shortlist candidate applications, schedule interview rounds directly from the Applicants page."
          />
        ) : (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Title</th>
                    <th>Scheduled Date & Time</th>
                    <th>Mode & Link</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((item) => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: '700', color: 'var(--slate-900)' }}>
                        {item.student?.name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '400' }}>
                          {item.student?.email}
                        </div>
                      </td>
                      <td>{item.job?.title || 'Job Listing'}</td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--slate-800)' }}>
                          {new Date(item.scheduledAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '0.85rem' }}>
                          {item.mode}
                        </span>
                        {item.meetingLinkOrLocation && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', wordBreak: 'break-all' }}>
                            {item.meetingLinkOrLocation.startsWith('http') ? (
                              <a href={item.meetingLinkOrLocation} target="_blank" rel="noreferrer">
                                Join Link →
                              </a>
                            ) : (
                              item.meetingLinkOrLocation
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rescheduled">Rescheduled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Interviews;
