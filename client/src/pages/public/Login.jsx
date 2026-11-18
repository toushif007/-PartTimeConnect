import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedInUser.role === 'student') {
        navigate('/student/dashboard');
      } else if (loggedInUser.role === 'employer') {
        navigate('/employer/dashboard');
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluation & grading
  const handleDemoFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
      }}
    >
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem' }}>
            <Briefcase size={22} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to access your portal dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@college.edu or company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Fill Buttons (MCA Mini Project Evaluation) */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-400)', textAlign: 'center', marginBottom: '0.75rem' }}>
            Quick Demo Login (1-Click Fill)
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoFill('student@parttimeconnect.com', 'student')}
            >
              Student
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoFill('vikram@techinnovators.com', 'employer')}
            >
              Employer
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoFill('admin@parttimeconnect.com', 'admin')}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Register footer */}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '1.75rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: '700', color: 'var(--primary-600)' }}>
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
