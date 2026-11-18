import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, MapPin, IndianRupee, Briefcase } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const RecommendedJobs = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/students/recommendations');
        if (res.success && res.data) {
          setRecommendations(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch recommendations:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <Loader message="Analyzing your profile against active part-time listings..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Title Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-600)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} /> Rule-Based Match Engine
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Recommended Jobs for You
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Computed by comparing your skills, education, location, and preferred work mode.
          </p>
        </div>

        {recommendations.length === 0 ? (
          <EmptyState
            title="No recommendations generated yet"
            description="Add your technical skills and education details in your Profile to help our matching engine score relevant roles."
            action={
              <Link to="/student/profile" className="btn btn-primary">
                Update My Skills
              </Link>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {recommendations.map(({ job, matchScore, matchingSkills, missingSkills, explanation }, index) => {
              // Color coding based on match score
              const scoreColor =
                matchScore >= 80 ? '#10b981' : matchScore >= 60 ? 'var(--primary-600)' : '#f59e0b';

              return (
                <div key={job._id || index} className="card card-hover" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                          {job.category?.name || 'Job'}
                        </span>
                        <StatusBadge status={job.workMode} />
                      </div>
                      <Link to={`/jobs/${job._id}`} style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--slate-900)', textDecoration: 'none' }}>
                        {job.title}
                      </Link>
                      <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                        {job.employer?.name || 'Verified Employer'} • {job.location}
                      </p>
                    </div>

                    {/* Match Score Badge */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: matchScore >= 75 ? 'var(--success-bg)' : 'var(--primary-50)',
                          border: `1px solid ${matchScore >= 75 ? 'var(--success-border)' : 'var(--primary-200)'}`,
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        <Sparkles size={16} color={scoreColor} />
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: scoreColor }}>
                          {matchScore}% Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Explanation */}
                  <div
                    style={{
                      background: 'var(--slate-50)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      color: 'var(--slate-700)',
                      marginBottom: '1.25rem',
                      borderLeft: `4px solid ${scoreColor}`,
                    }}
                  >
                    <strong>Match Analysis:</strong> {explanation}
                  </div>

                  {/* Matching vs Missing Skills Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    {/* Matching Skills */}
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#065f46', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} color="#10b981" /> Matching Skills ({matchingSkills.length})
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {matchingSkills.length > 0 ? (
                          matchingSkills.map((s, i) => (
                            <span key={i} style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.75rem', fontWeight: '600', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                              {s}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>None matched yet</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#92400e', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} color="#f59e0b" /> Skills to Acquire ({missingSkills.length})
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {missingSkills.length > 0 ? (
                          missingSkills.map((s, i) => (
                            <span key={i} style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.75rem', fontWeight: '600', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                              {s}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: '600' }}>You have all required skills!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Strip */}
                  <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                      ₹{job.stipend?.amount?.toLocaleString()}{' '}
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--slate-500)' }}>
                        /{job.stipend?.frequency}
                      </span>
                    </p>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                      View Opportunity <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default RecommendedJobs;
