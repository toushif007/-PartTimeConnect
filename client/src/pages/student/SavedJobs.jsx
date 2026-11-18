import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Trash2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await api.get('/saved-jobs');
      if (res.success && res.data) {
        setSavedJobs(res.data);
      }
    } catch (err) {
      console.warn('Error fetching saved jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      const res = await api.delete(`/saved-jobs/${jobId}`);
      if (res.success) {
        setSavedJobs((prev) => prev.filter((item) => item.job?._id !== jobId));
      }
    } catch (err) {
      alert(err.message || 'Failed to remove job from saved list');
    }
  };

  if (loading) return <Loader message="Loading bookmarked jobs..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Saved Jobs
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Part-time opportunities and internships bookmarked for later review.
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <EmptyState
            title="You don't have any saved jobs"
            description="Browse job openings and click the bookmark icon on any listing to save it here."
            action={
              <Link to="/jobs" className="btn btn-primary">
                Browse Open Jobs
              </Link>
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {savedJobs.map(({ job }) => (
              <div key={job._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      {job.category?.name || 'Job'}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--slate-900)', marginTop: '4px' }}>
                      {job.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                      {job.employer?.name || 'Company'} • {job.location}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnsave(job._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#ef4444', padding: '6px' }}
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <StatusBadge status={job.workMode} />
                  <StatusBadge status={job.jobType} />
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--slate-100)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                    ₹{job.stipend?.amount?.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--slate-500)' }}>/{job.stipend?.frequency}</span>
                  </span>
                  <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                    View & Apply <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedJobs;
