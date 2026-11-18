import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Bookmark,
  FileCheck,
  PlusCircle,
  Users,
  AlertTriangle,
  FolderTree,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
  const { user, isAuthenticated, isStudent, isEmployer, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Briefcase size={22} />
          </div>
          <span>PartTime<span style={{ color: 'var(--primary-600)' }}>Connect</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
            <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Browse Jobs
            </NavLink>

            {/* Role specific quick links */}
            {isAuthenticated && isStudent && (
              <>
                <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/student/recommendations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={16} color="var(--accent-600)" /> Recommendations
                  </span>
                </NavLink>
                <NavLink to="/student/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Applications
                </NavLink>
                <NavLink to="/student/saved-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Saved
                </NavLink>
              </>
            )}

            {isAuthenticated && isEmployer && (
              <>
                <NavLink to="/employer/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/employer/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  My Jobs
                </NavLink>
                <NavLink to="/employer/applicants" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Applicants
                </NavLink>
                <NavLink to="/employer/interviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Interviews
                </NavLink>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Users
                </NavLink>
                <NavLink to="/admin/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Jobs
                </NavLink>
                <NavLink to="/admin/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Categories
                </NavLink>
                <NavLink to="/admin/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Reports
                </NavLink>
              </>
            )}

            {!isAuthenticated && (
              <>
                <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  About
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Contact
                </NavLink>
              </>
            )}
          </ul>

          {/* User Auth Buttons or Profile Menu */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Notification Bell */}
              <Link
                to={isStudent ? '/student/notifications' : isEmployer ? '/employer/dashboard' : '/admin/dashboard'}
                className="notif-btn"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>

              {/* Employer quick Post Job button */}
              {isEmployer && (
                <Link to="/employer/post-job" className="btn btn-primary btn-sm">
                  <PlusCircle size={16} /> Post Job
                </Link>
              )}

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--slate-100)',
                    border: '1px solid var(--slate-200)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    color: 'var(--slate-800)',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--primary-600)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{user?.name?.split(' ')[0]}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isStudent ? 'var(--primary-100)' : isEmployer ? '#ede9fe' : '#fef3c7',
                      color: isStudent ? 'var(--primary-800)' : isEmployer ? '#6d28d9' : '#92400e',
                    }}
                  >
                    {user?.role}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {profileDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      background: '#ffffff',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                      width: '210px',
                      zIndex: 60,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--slate-100)' }}>
                      <p style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--slate-900)' }}>{user?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', wordBreak: 'break-all' }}>{user?.email}</p>
                    </div>

                    <div style={{ padding: '0.4rem' }}>
                      {isStudent && (
                        <>
                          <Link
                            to="/student/profile"
                            className="nav-link"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.8rem' }}
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <User size={16} /> My Profile & Resume
                          </Link>
                          <Link
                            to="/student/saved-jobs"
                            className="nav-link"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.8rem' }}
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <Bookmark size={16} /> Saved Jobs
                          </Link>
                        </>
                      )}

                      {isEmployer && (
                        <Link
                          to="/employer/profile"
                          className="nav-link"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.8rem' }}
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User size={16} /> Company Profile
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '0.5rem 0.8rem',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
