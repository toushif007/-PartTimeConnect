import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Resolution Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('reviewed');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [deleteJobFlag, setDeleteJobFlag] = useState(false);
  const [resolving, setResolving] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = status !== 'all' ? `?status=${status}` : '';
      const res = await api.get(`/reports${query}`);
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.warn('Error fetching reports:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status]);

  const openResolveModal = (report) => {
    setSelectedReport(report);
    setResolutionStatus(report.status === 'pending' ? 'reviewed' : report.status);
    setResolutionNotes(report.resolutionNotes || '');
    setDeleteJobFlag(false);
    setModalOpen(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setResolving(true);
    try {
      const res = await api.patch(`/reports/${selectedReport._id}/resolve`, {
        status: resolutionStatus,
        resolutionNotes,
        deleteJob: deleteJobFlag,
      });

      if (res.success) {
        setModalOpen(false);
        fetchReports();
      }
    } catch (err) {
      alert(err.message || 'Failed to resolve report');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Job Moderation Reports
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Review candidate-submitted complaints regarding fraudulent, misleading, or inappropriate job listings.
          </p>
        </div>

        {/* Filter bar */}
        <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Filter by Status:</label>
          <select className="form-select" style={{ maxWidth: '200px' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Reports</option>
            <option value="pending">Pending Only</option>
            <option value="reviewed">Reviewed</option>
            <option value="action_taken">Action Taken (Deleted)</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {loading ? (
          <Loader message="Loading reported listings..." />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No reports to review"
            description="The platform is clean! There are no flagged job listings matching your selection."
          />
        ) : (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reported Job</th>
                    <th>Reason Category</th>
                    <th>Report Details</th>
                    <th>Reported By</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--slate-900)' }}>
                          {r.job?.title || 'Deleted Job'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          Employer: {r.job?.employer?.name || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {r.reason?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--slate-700)', maxWidth: '280px' }}>
                        "{r.details}"
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{r.reportedBy?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{r.reportedBy?.email}</div>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <button onClick={() => openResolveModal(r)} className="btn btn-secondary btn-sm">
                          Review & Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resolution Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Resolve Job Report"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleResolveSubmit} disabled={resolving}>
                {resolving ? 'Saving...' : 'Update Report Status'}
              </button>
            </>
          }
        >
          {selectedReport && (
            <form onSubmit={handleResolveSubmit}>
              <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Complaint Details
                </p>
                <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--slate-900)', marginTop: '2px' }}>
                  Job: {selectedReport.job?.title}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                  <strong>Reported Reason:</strong> {selectedReport.reason}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                  <strong>Details:</strong> "{selectedReport.details}"
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Resolution Status</label>
                <select
                  className="form-select"
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                >
                  <option value="reviewed">Reviewed (No violation found)</option>
                  <option value="dismissed">Dismiss Report</option>
                  <option value="action_taken">Action Taken (Flagged / Resolved)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resolution Notes</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Document findings or actions taken by administrative staff..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>

              {selectedReport.job && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#991b1b', fontWeight: '600', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={deleteJobFlag}
                      onChange={(e) => setDeleteJobFlag(e.target.checked)}
                    />
                    <span>Permanently delete this reported job listing from the portal</span>
                  </label>
                </div>
              )}
            </form>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default ReportsManagement;
