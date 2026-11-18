import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Sparkles,
  FileCheck,
  Bookmark,
  Bell,
  Briefcase,
  PlusCircle,
  Users,
  Calendar,
  AlertTriangle,
  FolderTree,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Sidebar = () => {
  const { isStudent, isEmployer, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <aside className="dashboard-sidebar">
      <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-400)' }}>
          {isStudent ? 'Student Workspace' : isEmployer ? 'Employer Workspace' : 'Admin Control'}
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {isStudent && (
          <>
            <NavLink
              to="/student/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink
              to="/student/profile"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <User size={18} /> Profile & Resume
            </NavLink>
            <NavLink
              to="/student/recommendations"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <Sparkles size={18} color="var(--accent-600)" /> Recommended Jobs
            </NavLink>
            <NavLink
              to="/student/applications"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <FileCheck size={18} /> My Applications
            </NavLink>
            <NavLink
              to="/student/saved-jobs"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <Bookmark size={18} /> Saved Jobs
            </NavLink>
            <NavLink
              to="/student/notifications"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={18} /> Notifications
              </span>
              {unreadCount > 0 && <span className="notif-badge" style={{ position: 'static' }}>{unreadCount}</span>}
            </NavLink>
          </>
        )}

        {isEmployer && (
          <>
            <NavLink
              to="/employer/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink
              to="/employer/profile"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <User size={18} /> Company Profile
            </NavLink>
            <NavLink
              to="/employer/post-job"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <PlusCircle size={18} color="var(--primary-600)" /> Post a Part-Time Job
            </NavLink>
            <NavLink
              to="/employer/jobs"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <Briefcase size={18} /> My Job Listings
            </NavLink>
            <NavLink
              to="/employer/applicants"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <Users size={18} /> Applicants
            </NavLink>
            <NavLink
              to="/employer/interviews"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <Calendar size={18} /> Scheduled Interviews
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <LayoutDashboard size={18} /> Overview
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <Users size={18} /> Manage Users
            </NavLink>
            <NavLink
              to="/admin/jobs"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <Briefcase size={18} /> Moderate Jobs
            </NavLink>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <FolderTree size={18} /> Job Categories
            </NavLink>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem' }}
            >
              <AlertTriangle size={18} color="#ef4444" /> Reported Jobs
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
