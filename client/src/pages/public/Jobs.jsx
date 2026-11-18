import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Bookmark,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isStudent } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Filter States initialized from URL params
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'all');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'all');
  const [minStipend, setMinStipend] = useState(searchParams.get('minStipend') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data || []);
      } catch (err) {
        console.warn('Could not load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Student Saved Jobs if logged in
  useEffect(() => {
    if (isAuthenticated && isStudent) {
      const fetchSaved = async () => {
        try {
          const res = await api.get('/saved-jobs');
          if (res.success && res.data) {
            const ids = new Set(res.data.map((item) => item.job?._id).filter(Boolean));
            setSavedJobIds(ids);
          }
        } catch (err) {}
      };
      fetchSaved();
    }
  }, [isAuthenticated, isStudent]);

  // Fetch Jobs when filters or page change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (category && category !== 'all') params.set('category', category);
        if (workMode && workMode !== 'all') params.set('workMode', workMode);
        if (jobType && jobType !== 'all') params.set('jobType', jobType);
        if (minStipend) params.set('minStipend', minStipend);
        if (sortBy) params.set('sortBy', sortBy);
        params.set('page', page.toString());
        params.set('limit', '8');

        const res = await api.get(`/jobs?${params.toString()}`);
        if (res.success) {
          setJobs(res.data || []);
          if (res.meta) setMeta(res.meta);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [keyword, category, workMode, jobType, minStipend, sortBy, page]);

  const applyFilters = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (keyword) newParams.set('keyword', keyword);
    if (category && category !== 'all') newParams.set('category', category);
    if (workMode && workMode !== 'all') newParams.set('workMode', workMode);
    if (jobType && jobType !== 'all') newParams.set('jobType', jobType);
    if (minStipend) newParams.set('minStipend', minStipend);
    if (sortBy) newParams.set('sortBy', sortBy);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setKeyword('');
    setCategory('all');
    setWorkMode('all');
    setJobType('all');
    setMinStipend('');
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveJob = async (jobId) => {
    if (!isAuthenticated || !isStudent) return;
    try {
      if (savedJobIds.has(jobId)) {
        await api.delete(`/saved-jobs/${jobId}`);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await api.post(`/saved-jobs/${jobId}`);
        setSavedJobIds((prev) => new Set([...prev, jobId]));
      }
    } catch (err) {
      alert(err.message || 'Error updating bookmark');
    }
  };

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Explore Part-Time Jobs
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Showing {meta.total} verified part-time and internship openings
          </p>
        </div>

        {/* Layout: Sidebar Filter & Jobs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Filter Sidebar */}
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} /> Filters
              </h3>
              <button
                type="button"
                onClick={resetFilters}
                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Reset All
              </button>
            </div>

            <form onSubmit={applyFilters}>
              {/* Keyword Search */}
              <div className="form-group">
                <label className="form-label">Search Keyword</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. React, Content, Python"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Mode */}
              <div className="form-group">
                <label className="form-label">Work Mode</label>
                <select className="form-select" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                  <option value="all">All Modes</option>
                  <option value="remote">Remote (Work From Home)</option>
                  <option value="on-site">On-Site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Job Type */}
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="part-time">Part-Time</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              {/* Minimum Stipend */}
              <div className="form-group">
                <label className="form-label">Min Stipend (₹/month)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 10000"
                  value={minStipend}
                  onChange={(e) => setMinStipend(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <div className="form-group">
                <label className="form-label">Sort Listings By</label>
                <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="stipend_high">Highest Stipend</option>
                  <option value="stipend_low">Lowest Stipend</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Apply Filters
              </button>
            </form>
          </div>

          {/* Job Listings Column */}
          <div>
            {loading ? (
              <Loader message="Loading job listings..." />
            ) : jobs.length === 0 ? (
              <EmptyState
                title="No jobs found matching your criteria"
                description="Try relaxing your filters, searching for a different keyword, or resetting filter options."
                action={
                  <button onClick={resetFilters} className="btn btn-secondary">
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {jobs.map((job) => {
                  const isSaved = savedJobIds.has(job._id);
                  return (
                    <div
                      key={job._id}
                      className="card card-hover"
                      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: 'var(--primary-600)',
                                background: 'var(--primary-50)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              {job.category?.name || 'General'}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: '500' }}>
                              {job.company?.companyName || job.employer?.name || 'Verified Company'}
                            </span>
                          </div>

                          <Link
                            to={`/jobs/${job._id}`}
                            style={{
                              fontSize: '1.25rem',
                              fontWeight: '800',
                              color: 'var(--slate-900)',
                              textDecoration: 'none',
                              display: 'inline-block',
                            }}
                          >
                            {job.title}
                          </Link>
                        </div>

                        {/* Save Button for Students */}
                        {isAuthenticated && isStudent && (
                          <button
                            onClick={() => toggleSaveJob(job._id)}
                            style={{
                              background: isSaved ? 'var(--primary-50)' : 'transparent',
                              border: '1px solid',
                              borderColor: isSaved ? 'var(--primary-500)' : 'var(--slate-200)',
                              color: isSaved ? 'var(--primary-600)' : 'var(--slate-400)',
                              padding: '0.45rem',
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                            }}
                            title={isSaved ? 'Job Bookmarked' : 'Save Job'}
                          >
                            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                          </button>
                        )}
                      </div>

                      {/* Description snippet */}
                      <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                        {job.description.length > 180 ? `${job.description.substring(0, 180)}...` : job.description}
                      </p>

                      {/* Required skills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {(job.requiredSkills || []).map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              background: 'var(--slate-100)',
                              color: 'var(--slate-700)',
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: '600',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Details Strip */}
                      <div
                        style={{
                          borderTop: '1px solid var(--slate-100)',
                          paddingTop: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={15} color="var(--slate-400)" /> {job.location || 'Remote'}
                          </span>
                          <StatusBadge status={job.workMode} />
                          <StatusBadge status={job.jobType} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                              ₹{job.stipend?.amount?.toLocaleString()}{' '}
                              <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--slate-500)' }}>
                                /{job.stipend?.frequency}
                              </span>
                            </p>
                          </div>
                          <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                            View & Apply
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Controls */}
                {meta.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={meta.page <= 1}
                      onClick={() => handlePageChange(meta.page - 1)}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)', fontWeight: '600' }}>
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => handlePageChange(meta.page + 1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
