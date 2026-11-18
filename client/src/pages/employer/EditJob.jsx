import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('part-time');
  const [workMode, setWorkMode] = useState('remote');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [status, setStatus] = useState('active');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobAndCategories = async () => {
      try {
        const [catsRes, jobRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/jobs/${id}`),
        ]);

        if (catsRes.success) setCategories(catsRes.data || []);

        if (jobRes.success && jobRes.data) {
          const j = jobRes.data;
          setTitle(j.title || '');
          setCategory(j.category?._id || j.category || '');
          setJobType(j.jobType || 'part-time');
          setWorkMode(j.workMode || 'remote');
          setLocation(j.location || '');
          setDescription(j.description || '');
          setRequiredSkills(j.requiredSkills || []);
          if (j.stipend) {
            setAmount(j.stipend.amount || '');
            setFrequency(j.stipend.frequency || 'monthly');
            setIsNegotiable(!!j.stipend.isNegotiable);
          }
          setStatus(j.status || 'active');
        }
      } catch (err) {
        setError(err.message || 'Error loading job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndCategories();
  }, [id]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const clean = skillInput.trim();
    if (!requiredSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setRequiredSkills([...requiredSkills, clean]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await api.put(`/jobs/${id}`, {
        title,
        description,
        category,
        jobType,
        workMode,
        location,
        requiredSkills,
        stipend: {
          amount: Number(amount),
          frequency,
          isNegotiable,
        },
        status,
      });

      if (res.success) {
        navigate('/employer/jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading job for editing..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ maxWidth: '850px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              Edit Job Listing
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
              Update description, stipend details, or requirements.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                border: '1px solid var(--danger-border)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
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

          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Work Mode</label>
                  <select
                    className="form-select"
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                  >
                    <option value="remote">Remote (Work From Home)</option>
                    <option value="on-site">On-Site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active (Accepting Applications)</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / City</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Stipend */}
              <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Stipend Amount (₹)</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Frequency</label>
                    <select
                      className="form-select"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    >
                      <option value="monthly">Per Month</option>
                      <option value="hourly">Per Hour</option>
                      <option value="weekly">Per Week</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                  />
                  <span>Stipend is negotiable</span>
                </label>
              </div>

              {/* Skills */}
              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(e);
                      }
                    }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddSkill}>
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.5rem', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
                  {requiredSkills.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'var(--primary-100)',
                        color: 'var(--primary-800)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  required
                  rows="6"
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Update Job Listing'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditJob;
