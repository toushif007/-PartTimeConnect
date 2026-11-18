import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileCheck,
  AlertTriangle,
  FolderTree,
  ShieldCheck,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Error fetching admin statistics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <Loader message="Loading administrator dashboard..." />;

  const counts = data?.counts || {};

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-600)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={16} /> Platform Administration & Moderation
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            System Overview & Metrics
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Real-time analytics across all students, employers, job postings, and moderation reports.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Users size={24} />
            </div>
            <div>
              <p className="stat-val">{counts.totalStudents || 0}</p>
              <p className="stat-label">Registered Students</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <p className="stat-val">{counts.totalEmployers || 0}</p>
              <p className="stat-label">Registered Employers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <p className="stat-val">{counts.activeJobs || 0}</p>
              <p className="stat-label">Active Job Listings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>
              <FileCheck size={24} />
            </div>
            <div>
              <p className="stat-val">{counts.totalApplications || 0}</p>
              <p className="stat-label">Total Applications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: counts.pendingReports > 0 ? 'var(--danger-bg)' : 'var(--slate-100)', color: counts.pendingReports > 0 ? '#ef4444' : 'var(--slate-600)' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="stat-val" style={{ color: counts.pendingReports > 0 ? '#ef4444' : 'inherit' }}>
                {counts.pendingReports || 0}
              </p>
              <p className="stat-label">Pending Reports</p>
            </div>
          </div>
        </div>

        {/* Two Columns: Recent Users and Recent Jobs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Recent Signups */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                Recent User Registrations
              </h3>
              <Link to="/admin/users" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-600)' }}>
                Manage Users →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentUsers || []).map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--slate-900)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: u.role === 'student' ? 'var(--primary-100)' : '#ede9fe',
                            color: u.role === 'student' ? 'var(--primary-800)' : '#6d28d9',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                Recent Job Listings
              </h3>
              <Link to="/admin/jobs" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-600)' }}>
                Moderate Jobs →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Employer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentJobs || []).map((j) => (
                    <tr key={j._id}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--slate-900)' }}>{j.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          ₹{j.stipend?.amount?.toLocaleString()} • {j.category?.name}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                        {j.employer?.name || 'Employer'}
                      </td>
                      <td>
                        <StatusBadge status={j.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
