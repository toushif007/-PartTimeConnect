import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckCircle2, FileText, Briefcase, MapPin } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';

const ApplicationDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError('Application not found');
        }
      } catch (err) {
        setError(err.message || 'Error loading application');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  if (loading) return <Loader message="Loading application details..." />;
  if (error || !data) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>{error || 'Application not found'}</h3>
          <Link to="/student/applications" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Applications
          </Link>
        </main>
      </div>
    );
  }

  const { application } = data;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ maxWidth: '800px' }}>
          <Link
            to="/student/applications"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--slate-600)',
              marginBottom: '1.5rem',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={16} /> Back to My Applications
          </Link>

          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--primary-600)',
                    background: 'var(--primary-50)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                  }}
                >
                  {application.job?.category?.name || 'General'}
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--slate-900)', marginTop: '4px' }}>
                  {application.job?.title}
                </h1>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '2px' }}>
                  Employer: {application.employer?.name || 'Company'} • Submitted on{' '}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>

              <StatusBadge status={application.status} />
            </div>

            {/* Cover Note */}
            {application.coverNote && (
              <div style={{ background: 'var(--slate-50)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: '4px' }}>
                  Submitted Cover Note
                </p>
                <p style={{ color: 'var(--slate-700)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: '1.6' }}>
                  "{application.coverNote}"
                </p>
              </div>
            )}

            {/* Status Timeline */}
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              Chronological Status Updates
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.75rem' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '7px',
                  top: '10px',
                  bottom: '10px',
                  width: '2px',
                  background: 'var(--slate-200)',
                }}
              />

              {(application.timeline || []).map((step, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.75rem',
                      top: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'var(--primary-600)',
                      border: '3px solid #ffffff',
                      boxShadow: '0 0 0 1px var(--primary-200)',
                    }}
                  />
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--slate-900)', textTransform: 'capitalize' }}>
                      {step.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginLeft: '10px' }}>
                      {new Date(step.updatedAt).toLocaleString()}
                    </span>
                    {step.note && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                        {step.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationDetails;
