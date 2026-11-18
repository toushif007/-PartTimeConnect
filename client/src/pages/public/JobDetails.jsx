import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Building2,
  Bookmark,
  Share2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Send,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const JobDetails = () => {
  const { id } = useParams();
  const { user, profile, isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('incorrect_information');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.success && res.data) {
          setJob(res.data);
        } else {
          setError('Job not found.');
        }

        // Check if student already applied or saved
        if (isAuthenticated && isStudent) {
          try {
            const [appsRes, savedRes] = await Promise.all([
              api.get('/applications/my'),
              api.get('/saved-jobs'),
            ]);
            if (appsRes.success && appsRes.data) {
              const applied = appsRes.data.some((a) => a.job?._id === id);
              setAlreadyApplied(applied);
            }
            if (savedRes.success && savedRes.data) {
              const saved = savedRes.data.some((s) => s.job?._id === id);
              setIsSaved(saved);
            }
          } catch (e) {}
        }
      } catch (err) {
        setError(err.message || 'Error loading job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id, isAuthenticated, isStudent]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!isStudent) return;
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${id}`);
        setIsSaved(false);
      } else {
        await api.post(`/saved-jobs/${id}`);
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    if (!profile?.resume?.path) {
      alert('Please upload your resume in your Student Profile before applying!');
      return navigate('/student/profile');
    }

    setApplying(true);
    try {
      const res = await api.post('/applications', {
        jobId: id,
        coverNote,
      });
      if (res.success) {
        setApplySuccess(true);
        setAlreadyApplied(true);
        setTimeout(() => setApplyModalOpen(false), 2000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportDetails.trim()) return alert('Please enter report details.');

    setReporting(true);
    try {
      const res = await api.post('/reports', {
        jobId: id,
        reason: reportReason,
        details: reportDetails,
      });
      if (res.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReportSuccess(false);
          setReportDetails('');
        }, 2000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <Loader message="Fetching job details..." />;
  if (error || !job) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>{error || 'Job Not Found'}</h2>
        <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to All Jobs
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '85vh', background: 'var(--slate-50)' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Back navigation */}
        <Link
          to="/jobs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--slate-600)',
            marginBottom: '1.5rem',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Listings
        </Link>

        {/* Main Job Card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    background: 'var(--primary-100)',
                    color: 'var(--primary-800)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                  }}
                >
                  {job.category?.name}
                </span>
                <StatusBadge status={job.workMode} />
                <StatusBadge status={job.jobType} />
              </div>

              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                {job.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--slate-600)', fontSize: '0.95rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--slate-800)' }}>
                  {job.company?.companyName || job.employer?.name}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={16} color="var(--slate-400)" /> {job.location}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={16} color="var(--slate-400)" /> Posted on {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Stipend Card */}
            <div
              style={{
                background: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.75rem',
                textAlign: 'right',
              }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-800)', textTransform: 'uppercase' }}>
                Offered Stipend
              </p>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                ₹{job.stipend?.amount?.toLocaleString()}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: '500' }}>
                Per {job.stipend?.frequency} {job.stipend?.isNegotiable ? '(Negotiable)' : ''}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              borderTop: '1px solid var(--slate-100)',
              borderBottom: '1px solid var(--slate-100)',
              padding: '1.25rem 0',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isStudent && (
                <>
                  {alreadyApplied ? (
                    <button className="btn btn-secondary" disabled style={{ cursor: 'not-allowed', color: 'var(--success-text)' }}>
                      <CheckCircle size={18} color="var(--success-text)" /> Applied Already
                    </button>
                  ) : (
                    <button onClick={() => setApplyModalOpen(true)} className="btn btn-primary btn-lg">
                      <Send size={18} /> Apply for this Job
                    </button>
                  )}

                  <button onClick={handleToggleSave} className="btn btn-secondary" title={isSaved ? 'Remove Bookmark' : 'Save Job'}>
                    <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} color={isSaved ? 'var(--primary-600)' : 'currentColor'} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <Link to="/login" className="btn btn-primary btn-lg">
                  Sign In to Apply
                </Link>
              )}
            </div>

            {/* Report Job Button */}
            {isAuthenticated && isStudent && (
              <button
                onClick={() => setReportModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-500)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <AlertTriangle size={16} color="var(--slate-400)" /> Report suspicious listing
              </button>
            )}
          </div>

          {/* Job Description */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Job Description
            </h3>
            <div style={{ fontSize: '1rem', color: 'var(--slate-700)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Required Skills & Competencies
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(job.requiredSkills || []).map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--slate-100)',
                    color: 'var(--slate-800)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Company Overview */}
          {job.company && (
            <div style={{ background: 'var(--slate-50)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h4 style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                About {job.company.companyName}
              </h4>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                {job.company.companyDescription || 'A forward-thinking employer verified on PartTimeConnect.'}
              </p>
              {job.company.companyWebsite && (
                <a
                  href={job.company.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.875rem', fontWeight: '600' }}
                >
                  Visit Company Website →
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
        footer={
          applySuccess ? null : (
            <>
              <button className="btn btn-secondary" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </>
          )
        }
      >
        {applySuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>Application Submitted!</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
              The employer has been notified. You can track this application in your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="form-label">Resume to be Sent</label>
              <div
                style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.875rem',
                }}
              >
                <FileText size={20} color="var(--primary-600)" />
                <span style={{ fontWeight: '600', color: 'var(--slate-800)' }}>
                  {profile?.resume?.originalName || 'No resume uploaded yet'}
                </span>
              </div>
              {!profile?.resume?.path && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                  Please upload a resume on your profile before applying.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Cover Note / Why are you a good fit? (Optional)</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Briefly introduce your skills and availability for this role..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Report Job Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Suspicious Job Listing"
        footer={
          reportSuccess ? null : (
            <>
              <button className="btn btn-secondary" onClick={() => setReportModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReportSubmit} disabled={reporting}>
                {reporting ? 'Reporting...' : 'Submit Report'}
              </button>
            </>
          )
        }
      >
        {reportSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>Report Submitted</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
              Thank you for keeping PartTimeConnect safe. Our administrative team will review this listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit}>
            <div className="form-group">
              <label className="form-label">Reason for Report</label>
              <select
                className="form-select"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="fraud">Fraud / Scam / Asking for money</option>
                <option value="incorrect_information">Incorrect Information (Stipend/Location misleading)</option>
                <option value="inappropriate_content">Inappropriate / Offensive Content</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Details / Explanation</label>
              <textarea
                className="form-textarea"
                rows="4"
                required
                placeholder="Explain why this listing is inappropriate or suspicious..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default JobDetails;
