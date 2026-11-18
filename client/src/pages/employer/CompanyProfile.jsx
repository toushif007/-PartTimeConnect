import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Phone, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const CompanyProfile = () => {
  const { user, profile, updateProfileState } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('1-10');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await api.get('/employers/profile');
        if (res.success && res.data) {
          const p = res.data;
          setCompanyName(p.companyName || '');
          setCompanyWebsite(p.companyWebsite || '');
          setIndustry(p.industry || '');
          setCompanySize(p.companySize || '1-10');
          setLocation(p.location || '');
          setContactPhone(p.contactPhone || '');
          setCompanyDescription(p.companyDescription || '');
          updateProfileState(p);
        }
      } catch (err) {
        console.warn('Error fetching employer profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/employers/profile', {
        companyName,
        companyWebsite,
        industry,
        companySize,
        location,
        contactPhone,
        companyDescription,
      });

      if (res.success) {
        updateProfileState(res.data);
        setMessage({ type: 'success', text: 'Company profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update company profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading company profile..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              Company Profile
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
              Manage your company identity, branding, and contact information visible to applicants.
            </p>
          </div>

          {message.text && (
            <div
              style={{
                background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: message.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
                border: `1px solid ${message.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1.5rem',
              }}
            >
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Website</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Industry Domain</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Software & IT, Media, EdTech"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Size</label>
                  <select
                    className="form-select"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                  >
                    <option value="1-10">1-10 employees (Startup)</option>
                    <option value="11-50">11-50 employees (Growing Studio)</option>
                    <option value="51-200">51-200 employees (Midsize)</option>
                    <option value="201-500">201-500 employees (Large)</option>
                    <option value="500+">500+ employees (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">HQ Location / City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bengaluru, Karnataka"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Recruiter Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">About the Company / Mission</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Introduce your organization, work culture, and what students will learn..."
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Company Details'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
