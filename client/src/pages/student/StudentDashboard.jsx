import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Award,
  Calendar,
  Bookmark,
  Sparkles,
  ArrowRight,
  User,
  Clock,
  Briefcase,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/students/dashboard-stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Dashboard stats error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loader message="Loading your student portal..." />;

  const isResumeMissing = !profile?.resume?.path;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Welcome Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Track your part-time applications, interviews, and personalized recommendations.
          </p>
        </div>

        {/* Resume Missing Alert */}
        {isResumeMissing && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h4 style={{ fontWeight: '700', color: '#92400e', fontSize: '0.95rem' }}>
                Your Resume is Not Uploaded Yet!
              </h4>
              <p style={{ color: '#b45309', fontSize: '0.85rem', marginTop: '2px' }}>
                Employers require a resume (PDF/DOC/DOCX) before accepting applications.
              </p>
            </div>
            <Link to="/student/profile" className="btn btn-primary btn-sm">
              Upload Resume Now
            </Link>
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <FileCheck size={24} />
            </div>
            <div>
              <p className="stat-val">{stats?.totalApplications || 0}</p>
              <p className="stat-label">Applications Submitted</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fdf4ff', color: '#a21caf' }}>
              <Award size={24} />
            </div>
            <div>
              <p className="stat-val">{stats?.shortlisted || 0}</p>
              <p className="stat-label">Shortlisted Applications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <p className="stat-val">{stats?.interviews || 0}</p>
              <p className="stat-label">Interviews Scheduled</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}>
              <Bookmark size={24} />
            </div>
            <div>
              <p className="stat-val">{stats?.savedCount || 0}</p>
              <p className="stat-label">Saved Jobs</p>
            </div>
          </div>
        </div>

        {/* Quick Recommended Jobs Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-600))',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 2rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
              }}
            >
              <Sparkles size={14} /> Rule-Based Engine
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Personalized Job Recommendations</h3>
            <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '2px', maxWidth: '520px' }}>
              Our matching algorithm scored active part-time listings matching your skills and preferred work mode.
            </p>
          </div>
          <Link
            to="/student/recommendations"
            className="btn btn-secondary"
            style={{ fontWeight: '700', color: 'var(--primary-700)' }}
          >
            View Recommendations <ArrowRight size={16} />
          </Link>
        </div>

        {/* Recent Applications Section */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              Recent Applications
            </h3>
            <Link to="/student/applications" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-600)' }}>
              View All Applications →
            </Link>
          </div>

          {!stats?.recentApplications || stats.recentApplications.length === 0 ? (
            <EmptyState
              title="No applications submitted yet"
              description="Explore open part-time job listings and submit your first application!"
              action={
                <Link to="/jobs" className="btn btn-primary btn-sm">
                  Browse Open Jobs
                </Link>
              }
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentApplications.map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: '600', color: 'var(--slate-900)' }}>
                        {app.job?.title || 'Job Listing'}
                      </td>
                      <td>{app.job?.category?.name || 'General'}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/student/applications`} className="btn btn-secondary btn-sm">
                          Details
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

export default StudentDashboard;
