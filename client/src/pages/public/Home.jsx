import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Building2,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [jobsRes, catsRes] = await Promise.all([
          api.get('/jobs/featured'),
          api.get('/categories'),
        ]);
        if (jobsRes.success) setFeaturedJobs(jobsRes.data || []);
        if (catsRes.success) setCategories(catsRes.data || []);
      } catch (err) {
        console.warn('Could not load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
          padding: '4.5rem 1.5rem 3.5rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--slate-200)',
        }}
      >
        <div className="container" style={{ maxWidth: '850px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-100)',
              color: 'var(--primary-800)',
              fontSize: '0.825rem',
              fontWeight: '700',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} color="var(--primary-600)" /> Flexible Work Built for College Students
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: '800',
              color: 'var(--slate-900)',
              lineHeight: '1.15',
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
            }}
          >
            Find Your Ideal <span style={{ color: 'var(--primary-600)' }}>Part-Time Job</span> & Launch Your Career
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--slate-600)',
              lineHeight: '1.6',
              marginBottom: '2.5rem',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
            }}
          >
            Connect with verified employers offering part-time roles, internships, and freelance projects designed to fit around your college schedule.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              background: '#ffffff',
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--slate-200)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, paddingLeft: '0.75rem' }}>
              <Search size={20} color="var(--slate-400)" />
              <input
                type="text"
                placeholder="Job title, skills (e.g. React, Content, Python)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--slate-800)',
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search Jobs
            </button>
          </form>

          {/* Quick Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '2.5rem',
              color: 'var(--slate-600)',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} color="var(--primary-600)" /> 100% Free for Students
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--primary-600)" /> Verified Employers & Real Stipends
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="var(--primary-600)" /> Flexible Work Hours
            </span>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section style={{ padding: '3.5rem 1.5rem', background: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                Popular Categories
              </h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
                Explore part-time openings categorized by domain
              </p>
            </div>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat._id}
                to={`/jobs?category=${cat._id}`}
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-50)',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                    {cat.name}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Explore Roles</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section style={{ padding: '3.5rem 1.5rem', background: 'var(--slate-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                Latest Job Openings
              </h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
                Handpicked flexible part-time listings active right now
              </p>
            </div>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              Explore All Jobs
            </Link>
          </div>

          {loading ? (
            <Loader message="Loading available jobs..." />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {featuredJobs.map((job) => (
                <div key={job._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          color: 'var(--primary-600)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {job.category?.name || 'Job'}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--slate-900)', marginTop: '2px' }}>
                        {job.title}
                      </h3>
                    </div>
                    <StatusBadge status={job.workMode} />
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1rem', flex: 1, lineHeight: '1.5' }}>
                    {job.description.length > 130 ? `${job.description.substring(0, 130)}...` : job.description}
                  </p>

                  {/* Skills tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                    {(job.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          background: 'var(--slate-100)',
                          color: 'var(--slate-700)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: '500',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Footer stipend & action */}
                  <div
                    style={{
                      borderTop: '1px solid var(--slate-100)',
                      paddingTop: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase' }}>Stipend</p>
                      <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                        ₹{job.stipend?.amount?.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--slate-500)' }}>/{job.stipend?.frequency}</span>
                      </p>
                    </div>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4rem 1.5rem', background: '#ffffff', borderTop: '1px solid var(--slate-200)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
            How PartTimeConnect Works
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '1rem', marginBottom: '3rem' }}>
            Simple, streamlined 3-step pathway to part-time employment
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--primary-100)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>Create Profile</h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                Add your college, course details, key skills, and upload your resume securely.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#ede9fe',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>Get Recommended</h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                Our rule-based engine matches your skills against live job listings and scores opportunities.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--success-bg)',
                  color: 'var(--success-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>Apply & Track</h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                Submit applications in 1-click, track application timelines, and schedule interviews.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
