import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Eye,
  Pause,
  Play,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/employers/jobs');
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.warn('Error fetching employer jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId) => {
    try {
      const res = await api.patch(`/jobs/${jobId}/status`);
      if (res.success) {
        fetchJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing? This will also remove associated applications.')) {
      return;
    }

    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.success) {
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  if (loading) return <Loader message="Loading your job postings..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              My Job Listings
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
              Manage, pause, edit, and track applicants for your posted positions.
            </p>
          </div>

          <Link to="/employer/post-job" className="btn btn-primary">
            <PlusCircle size={18} /> Post a Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="You haven't posted any jobs yet"
            description="Create a part-time job or internship listing to start attracting talented student candidates."
            action={
              <Link to="/employer/post-job" className="btn btn-primary">
                Post Your First Job
              </Link>
            }
          />
        ) : (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Category & Mode</th>
                    <th>Stipend</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--slate-900)' }}>{job.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          Posted on {new Date(job.createdAt).toLocaleDateString()} • {job.viewsCount || 0} views
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-800)' }}>
                          {job.category?.name || 'General'}
                        </div>
                        <div style={{ marginTop: '2px' }}>
                          <StatusBadge status={job.workMode} />
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--primary-700)' }}>
                        ₹{job.stipend?.amount?.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--slate-500)' }}>
                          /{job.stipend?.frequency}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/employer/applicants?jobId=${job._id}`}
                          className="badge badge-applied"
                          style={{ textDecoration: 'none', cursor: 'pointer' }}
                        >
                          <Users size={12} /> {job.applicationsCount || 0} Applicants
                        </Link>
                      </td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {/* Toggle Active / Pause */}
                          <button
                            onClick={() => handleToggleStatus(job._id)}
                            className="btn btn-secondary btn-sm"
                            title={job.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
                            style={{ padding: '6px' }}
                          >
                            {job.status === 'active' ? <Pause size={14} color="#f59e0b" /> : <Play size={14} color="#10b981" />}
                          </button>

                          {/* Edit */}
                          <Link
                            to={`/employer/edit-job/${job._id}`}
                            className="btn btn-secondary btn-sm"
                            title="Edit Job"
                            style={{ padding: '6px' }}
                          >
                            <Edit size={14} />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="btn btn-danger btn-sm"
                            title="Delete Job"
                            style={{ padding: '6px', background: 'transparent', color: '#ef4444', border: '1px solid #fecaca' }}
                          >
                            <Trash2 size={14} />
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
      </main>
    </div>
  );
};

export default MyJobs;
