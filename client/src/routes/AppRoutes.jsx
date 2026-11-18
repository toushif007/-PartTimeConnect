import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Protected Route Guard
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/public/Home';
import Jobs from '../pages/public/Jobs';
import JobDetails from '../pages/public/JobDetails';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import RecommendedJobs from '../pages/student/RecommendedJobs';
import Applications from '../pages/student/Applications';
import ApplicationDetails from '../pages/student/ApplicationDetails';
import SavedJobs from '../pages/student/SavedJobs';
import Notifications from '../pages/student/Notifications';

// Employer Pages
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import CompanyProfile from '../pages/employer/CompanyProfile';
import MyJobs from '../pages/employer/MyJobs';
import PostJob from '../pages/employer/PostJob';
import EditJob from '../pages/employer/EditJob';
import Applicants from '../pages/employer/Applicants';
import Interviews from '../pages/employer/Interviews';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersManagement from '../pages/admin/UsersManagement';
import JobsManagement from '../pages/admin/JobsManagement';
import CategoriesManagement from '../pages/admin/CategoriesManagement';
import ReportsManagement from '../pages/admin/ReportsManagement';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Student Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/recommendations"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <RecommendedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Applications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications/:id"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ApplicationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/saved-jobs"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <SavedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Employer Protected Routes */}
      <Route
        path="/employer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/profile"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <CompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/jobs"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <MyJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/post-job"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/edit-job/:id"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EditJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/applicants"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <Applicants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/interviews"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <Interviews />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <JobsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CategoriesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReportsManagement />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
