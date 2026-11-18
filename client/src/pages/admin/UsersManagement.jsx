import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldAlert, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [isBlocked, setIsBlocked] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role && role !== 'all') params.set('role', role);
      if (search.trim()) params.set('search', search.trim());
      if (isBlocked !== '') params.set('isBlocked', isBlocked);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.warn('Error fetching users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, isBlocked]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleBlock = async (userId, currentStatus, userName) => {
    const action = currentStatus ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} ${userName}?`)) return;

    try {
      const res = await api.patch(`/admin/users/${userId}/block`);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: !currentStatus } : u))
        );
      }
    } catch (err) {
      alert(err.message || `Failed to ${action} user`);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            User Management
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Inspect student and employer accounts, verify profiles, and moderate access.
          </p>
        </div>

        {/* Search & Filter Bar */}
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
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 2, minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={16} /> Search
            </button>
          </form>

          {/* Role Filter */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Blocked Filter */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select
              className="form-select"
              value={isBlocked}
              onChange={(e) => setIsBlocked(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="false">Active Only</option>
              <option value="true">Blocked Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <Loader message="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users match your criteria"
            description="Try adjusting your search terms or role filters."
          />
        ) : (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Profile Info</th>
                    <th>Account Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--slate-900)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background:
                              u.role === 'student'
                                ? 'var(--primary-100)'
                                : u.role === 'employer'
                                ? '#ede9fe'
                                : '#fef3c7',
                            color:
                              u.role === 'student'
                                ? 'var(--primary-800)'
                                : u.role === 'employer'
                                ? '#6d28d9'
                                : '#92400e',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.role === 'student' && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                            {u.profile?.college || 'College not added'}
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                              {u.profile?.course || ''}
                            </div>
                          </div>
                        )}
                        {u.role === 'employer' && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                            {u.profile?.companyName || 'Company not added'}
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                              {u.profile?.location || ''}
                            </div>
                          </div>
                        )}
                        {u.role === 'admin' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>System Staff</span>
                        )}
                      </td>
                      <td>
                        {u.isBlocked ? (
                          <span
                            style={{
                              background: 'var(--danger-bg)',
                              color: 'var(--danger-text)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                            }}
                          >
                            Blocked
                          </span>
                        ) : (
                          <span
                            style={{
                              background: 'var(--success-bg)',
                              color: 'var(--success-text)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                            }}
                          >
                            Active
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlock(u._id, u.isBlocked, u.name)}
                            className={`btn btn-sm ${u.isBlocked ? 'btn-secondary' : 'btn-danger'}`}
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            {u.isBlocked ? (
                              <>
                                <UserCheck size={14} color="#10b981" /> Unblock
                              </>
                            ) : (
                              <>
                                <UserX size={14} /> Block User
                              </>
                            )}
                          </button>
                        )}
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

export default UsersManagement;
