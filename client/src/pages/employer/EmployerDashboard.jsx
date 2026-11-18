import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  Calendar,
  PlusCircle,
  ArrowRight,
  Building2,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const EmployerDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/employers/dashboard-stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Employer dashboard stats error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader message="Loading employer dashboard..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              Employer Dashboard
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
              {profile?.companyName || user?.name} • Manage your part-time openings and applicants.
            </p>
          </div>

          <Link to="/employer/post-job" className="btn btn-primary">
            <PlusCircle size={18} /> Post a New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <p className="stat-val">{stats?.totalJobs || 0}</p>
              <p className="stat-label">Total Jobs Posted</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>
              <Clock size={24} />
            </div>
            <div>
              <p className="stat-val">{stats?.activeJobs || 0}</p>
              <p className="stat-label">Active Job Listings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <Users size={24} />
            </div>
            <div>
              <p className="stat-val">{stats?.totalApplicants || 0}</p>
              <p className="stat-label">Total Applicants</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <p className="stat-val">{stats?.scheduledInterviews || 0}</p>
              <p className="stat-label">Interviews Scheduled</p>
            </div>
          </div>
        </div>

        {/* Recent Applications Received */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              Recent Applicants
            </h3>
            <Link to="/employer/applicants" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-600)' }}>
              View All Applicants →
            </Link>
          </div>

          {!stats?.recentApplications || stats.recentApplications.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No applications received yet"
              description="Post a part-time job or internship to begin receiving verified student applicants."
              action={
                <Link to="/employer/post-job" className="btn btn-primary btn-sm">
                  Post Your First Job
                </Link>
              }
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Job</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentApplications.map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: '600', color: 'var(--slate-900)' }}>
                        {app.student?.name || 'Student Candidate'}
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '400' }}>
                          {app.student?.email}
                        </div>
                      </td>
                      <td>{app.job?.title || 'Job Listing'}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to="/employer/applicants" className="btn btn-secondary btn-sm">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;
