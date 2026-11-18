import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Trash2, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const JobsManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search.trim()) params.set('search', search.trim());

      const res = await api.get(`/admin/jobs?${params.toString()}`);
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.warn('Error fetching moderation jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${jobTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/jobs/${jobId}`);
      if (res.success) {
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Job Moderation & Management
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Review, verify, and moderate job postings across all categories.
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
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 2, minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by job title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={16} /> Search
            </button>
          </form>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="paused">Paused Only</option>
              <option value="closed">Closed Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Loader message="Loading jobs for moderation..." />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="No job listings match your current search or status filter."
          />
        ) : (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title & Category</th>
                    <th>Employer</th>
                    <th>Location & Mode</th>
                    <th>Stipend</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--slate-900)' }}>{job.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {job.category?.name || 'General'} • Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-800)' }}>
                          {job.employer?.name || 'Employer'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          {job.employer?.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>{job.location}</div>
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
                        <StatusBadge status={job.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <a
                            href={`/jobs/${job._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            title="View Public Listing"
                            style={{ padding: '6px' }}
                          >
                            <Eye size={14} />
                          </a>

                          <button
                            onClick={() => handleDeleteJob(job._id, job.title)}
                            className="btn btn-danger btn-sm"
                            title="Remove Inappropriate Job"
                            style={{ padding: '6px' }}
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

export default JobsManagement;
