import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Plus, X, Briefcase, Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const PostJob = () => {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('part-time');
  const [workMode, setWorkMode] = useState('remote');
  const [location, setLocation] = useState('Remote, India');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [vacancies, setVacancies] = useState('1');
  const [deadline, setDeadline] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.success && res.data?.length > 0) {
          setCategories(res.data);
          setCategory(res.data[0]._id);
        }
      } catch (err) {
        console.warn('Error loading categories:', err.message);
      }
    };
    fetchCats();
  }, []);

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
    setError('');

    if (!title || !description || !category || !amount) {
      return setError('Please fill in all required fields (title, category, stipend, description).');
    }

    setLoading(true);

    try {
      const res = await api.post('/jobs', {
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
        vacancies: Number(vacancies),
        deadline: deadline || null,
      });

      if (res.success) {
        navigate('/employer/jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to post job listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ maxWidth: '850px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              Post a Part-Time Job
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
              Publish a flexible opening or internship to connect with student candidates.
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
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Junior React Frontend Developer (Part-Time)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    required
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
                  <label className="form-label">Work Mode *</label>
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
                  <label className="form-label">Job Type *</label>
                  <select
                    className="form-select"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="part-time">Part-Time</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Location / City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Remote, or Bengaluru, Karnataka"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={vacancies}
                    onChange={(e) => setVacancies(e.target.value)}
                  />
                </div>
              </div>

              {/* Stipend Details */}
              <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)', marginBottom: '1rem' }}>
                  Stipend & Compensation
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Stipend Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-input"
                      placeholder="e.g. 15000"
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
                      <option value="fixed">Fixed Project</option>
                    </select>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                  />
                  <span>Stipend is negotiable based on candidate experience</span>
                </label>
              </div>

              {/* Skills Input */}
              <div className="form-group">
                <label className="form-label">Required Skills (Matching Criteria)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type skill and press Add (e.g. React, JavaScript, CSS)..."
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

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '38px', padding: '0.5rem', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
                  {requiredSkills.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)', alignSelf: 'center' }}>
                      Add at least 1 or 2 skills for recommendation matching
                    </span>
                  ) : (
                    requiredSkills.map((s, idx) => (
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
                    ))
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Detailed Job Description & Requirements *</label>
                <textarea
                  required
                  rows="6"
                  className="form-textarea"
                  placeholder="Outline responsibilities, weekly hour requirements, mentoring, and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application Deadline (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '1rem' }}>
                <PlusCircle size={18} /> {loading ? 'Publishing...' : 'Publish Job Listing'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostJob;
