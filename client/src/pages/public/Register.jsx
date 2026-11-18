import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, GraduationCap, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'employer' ? 'employer' : 'student';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student specific fields
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [location, setLocation] = useState('');

  // Employer specific fields
  const [companyName, setCompanyName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        location,
      };

      if (role === 'student') {
        payload.college = college;
        payload.course = course;
      } else {
        payload.companyName = companyName;
      }

      const createdUser = await register(payload);

      if (createdUser.role === 'student') {
        navigate('/student/dashboard');
      } else if (createdUser.role === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
      }}
    >
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Join PartTimeConnect
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Choose your role and create your free account
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'var(--slate-100)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'student' ? '#ffffff' : 'transparent',
              color: role === 'student' ? 'var(--primary-700)' : 'var(--slate-600)',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={18} /> Student
          </button>

          <button
            type="button"
            onClick={() => setRole('employer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'employer' ? '#ffffff' : 'transparent',
              color: role === 'employer' ? 'var(--primary-700)' : 'var(--slate-600)',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: role === 'employer' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={18} /> Employer
          </button>
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
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{role === 'student' ? 'Full Name' : 'Contact Person Name'}</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. name@college.edu or name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Conditional Fields based on Role */}
          {role === 'student' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">College / University</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. NIT Bangalore"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Degree / Course</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MCA, B.Tech, BCA"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">Company / Organization Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. TechCorp Solutions Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">City / Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bengaluru, Mumbai, Pune"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'student' ? 'Student' : 'Employer'}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '700', color: 'var(--primary-600)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
