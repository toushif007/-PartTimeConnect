import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Clock, Calendar, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.warn('Error fetching applications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await api.delete(`/applications/${appId}/withdraw`);
      if (res.success) {
        alert('Application withdrawn successfully.');
        fetchApplications();
      }
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  const openTimelineModal = (app) => {
    setSelectedApp(app);
    setTimelineModalOpen(true);
  };

  if (loading) return <Loader message="Loading your applications..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            My Applications
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Track application review progress, employer status updates, and interview milestones.
          </p>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="You haven't applied to any jobs yet"
            description="Explore part-time opportunities and apply using your uploaded profile resume."
            action={
              <Link to="/jobs" className="btn btn-primary">
                Browse Open Jobs
              </Link>
            }
          />
        ) : (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title & Employer</th>
                    <th>Category</th>
                    <th>Stipend</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const canWithdraw = ['applied', 'shortlisted'].includes(app.status);

                    return (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                            {app.job?.title || 'Job Listing'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                            {app.job?.employer?.name || 'Company'}
                          </div>
                        </td>
                        <td>{app.job?.category?.name || 'General'}</td>
                        <td style={{ fontWeight: '700', color: 'var(--primary-700)' }}>
                          ₹{app.job?.stipend?.amount?.toLocaleString() || 'N/A'}{' '}
                          <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--slate-500)' }}>
                            /{app.job?.stipend?.frequency || 'mo'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => openTimelineModal(app)}
                              className="btn btn-secondary btn-sm"
                            >
                              Timeline
                            </button>

                            {canWithdraw && (
                              <button
                                onClick={() => handleWithdraw(app._id)}
                                className="btn btn-danger btn-sm"
                                style={{ background: 'transparent', color: '#ef4444', border: '1px solid #fecaca' }}
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Application Timeline Modal */}
        <Modal
          isOpen={timelineModalOpen}
          onClose={() => setTimelineModalOpen(false)}
          title={`Application Status History`}
          footer={
            <button className="btn btn-primary" onClick={() => setTimelineModalOpen(false)}>
              Close
            </button>
          }
        >
          {selectedApp && (
            <div>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '1rem' }}>
                <h4 style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--slate-900)' }}>
                  {selectedApp.job?.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <StatusBadge status={selectedApp.status} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    Submitted on {new Date(selectedApp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Cover Note */}
              {selectedApp.coverNote && (
                <div style={{ background: 'var(--slate-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: '4px' }}>
                    Cover Note
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)', fontStyle: 'italic' }}>
                    "{selectedApp.coverNote}"
                  </p>
                </div>
              )}

              {/* Chronological Timeline */}
              <h5 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--slate-800)' }}>
                Status Progression
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
                {/* Timeline vertical bar */}
                <div
                  style={{
                    position: 'absolute',
                    left: '6px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    background: 'var(--slate-200)',
                  }}
                />

                {(selectedApp.timeline || []).map((step, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-1.5rem',
                        top: '4px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: 'var(--primary-600)',
                        border: '2px solid #ffffff',
                      }}
                    />
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--slate-900)', textTransform: 'capitalize' }}>
                        {step.status.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginLeft: '8px' }}>
                        {new Date(step.updatedAt).toLocaleString()}
                      </span>
                      {step.note && (
                        <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default Applications;
