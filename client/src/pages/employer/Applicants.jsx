import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  GraduationCap,
  MapPin,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const Applicants = () => {
  const [searchParams] = useSearchParams();
  const filterJobId = searchParams.get('jobId');

  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(filterJobId || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Candidate Details Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeApplicant, setActiveApplicant] = useState(null);

  // Interview Schedule Modal
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewMode, setInterviewMode] = useState('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [instructions, setInstructions] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/employers/jobs'),
        api.get('/employers/applicants'),
      ]);

      if (jobsRes.success) setJobs(jobsRes.data || []);
      if (appsRes.success) setApplicants(appsRes.data || []);
    } catch (err) {
      console.warn('Error fetching applicants:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Status
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const res = await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      if (res.success) {
        setApplicants((prev) =>
          prev.map((a) => (a._id === applicationId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  // Secure Resume Download
  const handleDownloadResume = async (applicationId, candidateName) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/employers/applicants/${applicationId}/resume`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Could not download resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to download resume');
    }
  };

  // Open Schedule Interview Modal
  const openInterviewModal = (app) => {
    setActiveApplicant(app);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewMode('online');
    setMeetingLink('');
    setInstructions('');
    setInterviewModalOpen(true);
  };

  // Submit Scheduled Interview
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      return alert('Please select date and time for the interview.');
    }

    setScheduling(true);
    try {
      const scheduledAt = new Date(`${interviewDate}T${interviewTime}`);

      const res = await api.post('/interviews', {
        applicationId: activeApplicant._id,
        scheduledAt: scheduledAt.toISOString(),
        mode: interviewMode,
        meetingLinkOrLocation: meetingLink,
        instructions,
      });

      if (res.success) {
        alert('Interview scheduled successfully! Candidate has been notified.');
        setInterviewModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesJob = selectedJob === 'all' || app.job?._id === selectedJob;
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    return matchesJob && matchesStatus;
  });

  if (loading) return <Loader message="Loading applicants..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Candidate Applications
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Review candidate profiles, download resumes securely, update hiring status, and schedule interviews.
          </p>
        </div>

        {/* Filter Bar */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label className="form-label">Filter by Job Posting</label>
            <select
              className="form-select"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="all">All Jobs ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="form-label">Filter by Application Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied (New)</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applicants Table */}
        {filteredApplicants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants found"
            description="There are currently no candidates matching the selected job or status filter."
          />
        ) : (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Applied Job</th>
                    <th>College & Course</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--slate-900)' }}>
                          {app.student?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {app.student?.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--slate-800)' }}>
                          {app.job?.title || 'Job Listing'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          ₹{app.job?.stipend?.amount?.toLocaleString()} ({app.job?.workMode})
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                          {app.studentProfile?.college || 'College specified in CV'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {app.studentProfile?.course || ''}
                        </div>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', fontWeight: '600' }}
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlist</option>
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="hired">Hire</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {/* Secure Resume Download Button */}
                          <button
                            onClick={() => handleDownloadResume(app._id, app.student?.name || 'Applicant')}
                            className="btn btn-secondary btn-sm"
                            title="Download Candidate Resume Securely"
                            style={{ padding: '6px' }}
                          >
                            <Download size={14} color="var(--primary-600)" />
                          </button>

                          {/* Profile Details */}
                          <button
                            onClick={() => {
                              setActiveApplicant(app);
                              setDetailModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            title="View Candidate Profile"
                            style={{ padding: '6px' }}
                          >
                            <Users size={14} />
                          </button>

                          {/* Schedule Interview */}
                          <button
                            onClick={() => openInterviewModal(app)}
                            className="btn btn-primary btn-sm"
                            title="Schedule Interview"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          >
                            <Calendar size={13} /> Interview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applicant Profile Modal */}
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Candidate Profile Details"
          footer={
            <button className="btn btn-primary" onClick={() => setDetailModalOpen(false)}>
              Close
            </button>
          }
        >
          {activeApplicant && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: '800',
                  }}
                >
                  {activeApplicant.student?.name?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{activeApplicant.student?.name}</h3>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{activeApplicant.student?.email}</p>
                </div>
              </div>

              {/* Education & Background */}
              <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginBottom: '4px' }}>
                  <strong>College:</strong> {activeApplicant.studentProfile?.college || 'Not specified'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginBottom: '4px' }}>
                  <strong>Course:</strong> {activeApplicant.studentProfile?.course || 'Not specified'}{' '}
                  {activeApplicant.studentProfile?.graduationYear ? `(Class of ${activeApplicant.studentProfile.graduationYear})` : ''}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                  <strong>Location:</strong> {activeApplicant.studentProfile?.location || 'Not specified'}
                </p>
              </div>

              {/* Skills */}
              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                  Skills Listed
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(activeApplicant.studentProfile?.skills || []).map((s, idx) => (
                    <span key={idx} style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '600' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Note */}
              {activeApplicant.coverNote && (
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                    Candidate's Cover Note
                  </h5>
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontStyle: 'italic', background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    "{activeApplicant.coverNote}"
                  </p>
                </div>
              )}

              {/* Resume download link */}
              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1rem' }}>
                <button
                  onClick={() => handleDownloadResume(activeApplicant._id, activeApplicant.student?.name || 'Applicant')}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                  <Download size={16} /> Download Full Candidate Resume (PDF)
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Schedule Interview Modal */}
        <Modal
          isOpen={interviewModalOpen}
          onClose={() => setInterviewModalOpen(false)}
          title={`Schedule Interview with ${activeApplicant?.student?.name}`}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setInterviewModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleScheduleSubmit} disabled={scheduling}>
                {scheduling ? 'Scheduling...' : 'Confirm & Notify Student'}
              </button>
            </>
          }
        >
          <form onSubmit={handleScheduleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Interview Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interview Time *</label>
                <input
                  type="time"
                  required
                  className="form-input"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Interview Mode *</label>
              <select
                className="form-select"
                value={interviewMode}
                onChange={(e) => setInterviewMode(e.target.value)}
              >
                <option value="online">Online (Google Meet / Zoom)</option>
                <option value="in-person">In-Person (Office)</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Meeting Link or Location</label>
              <input
                type="text"
                className="form-input"
                placeholder={interviewMode === 'online' ? 'https://meet.google.com/xyz' : 'Office address or phone number'}
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preparation Instructions</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Please be ready with your code portfolio and resume..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default Applicants;
