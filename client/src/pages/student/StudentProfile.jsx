import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  MapPin,
  Phone,
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const StudentProfile = () => {
  const { user, profile, updateProfileState } = useAuth();

  // Form State
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  // Resume State
  const [resumeInfo, setResumeInfo] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/students/profile');
        if (res.success && res.data) {
          const p = res.data;
          setCollege(p.college || '');
          setCourse(p.course || '');
          setGraduationYear(p.graduationYear || '');
          setPhone(p.phone || '');
          setLocation(p.location || '');
          setBio(p.bio || '');
          setSkills(p.skills || []);
          if (p.resume?.filename) {
            setResumeInfo(p.resume);
          }
          updateProfileState(p);
        }
      } catch (err) {
        console.warn('Error fetching student profile:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Add skill tag
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const clean = skillInput.trim();
    if (!skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSkills([...skills, clean]);
    }
    setSkillInput('');
  };

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Save profile information
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/students/profile', {
        college,
        course,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        phone,
        location,
        bio,
        skills,
      });

      if (res.success) {
        updateProfileState(res.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Upload Resume handler (PDF, DOC, DOCX max 5MB)
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return setMessage({ type: 'error', text: 'File size exceeds 5 MB limit.' });
    }

    // Validate extension
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      return setMessage({ type: 'error', text: 'Invalid file format. Only PDF, DOC, and DOCX are allowed.' });
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    setMessage({ type: '', text: '' });

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/students/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (data.success && data.data?.resume) {
        setResumeInfo(data.data.resume);
        setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
        // Refresh profile state
        const refRes = await api.get('/students/profile');
        if (refRes.data) updateProfileState(refRes.data);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Resume upload failed' });
    } finally {
      setUploadingResume(false);
    }
  };

  // Download Own Resume
  const handleDownloadResume = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/students/resume`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to download resume file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resumeInfo?.originalName || 'My_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Could not download resume');
    }
  };

  // Delete Resume
  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;

    try {
      const res = await api.delete('/students/resume');
      if (res.success) {
        setResumeInfo(null);
        setMessage({ type: 'success', text: 'Resume removed successfully.' });
        const refRes = await api.get('/students/profile');
        if (refRes.data) updateProfileState(refRes.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete resume');
    }
  };

  if (loading) return <Loader message="Loading profile..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              My Profile & Resume
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
              Manage your academic background, technical skills, and secure resume document.
            </p>
          </div>

          {/* Feedback banner */}
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

          {/* Section 1: Resume Management Card */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--slate-900)' }}>Resume Document</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Allowed: PDF, DOC, DOCX (Max 5 MB)</p>
              </div>
            </div>

            {resumeInfo?.originalName ? (
              <div
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={32} color="var(--primary-600)" />
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--slate-800)' }}>
                      {resumeInfo.originalName}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {resumeInfo.size ? `${(resumeInfo.size / (1024 * 1024)).toFixed(2)} MB` : ''} • Uploaded on{' '}
                      {resumeInfo.uploadDate ? new Date(resumeInfo.uploadDate).toLocaleDateString() : 'Active'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button onClick={handleDownloadResume} className="btn btn-secondary btn-sm" title="Download Resume">
                    <Download size={16} /> Download
                  </button>
                  <button onClick={handleDeleteResume} className="btn btn-danger btn-sm" title="Delete Resume">
                    <Trash2 size={16} /> Delete
                  </button>
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={16} /> Replace
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingResume}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed var(--slate-300)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: 'var(--slate-50)',
                }}
              >
                <Upload size={36} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontWeight: '700', color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
                  No resume uploaded yet
                </h4>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Upload your CV to apply for part-time jobs and internships
                </p>
                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> {uploadingResume ? 'Uploading...' : 'Upload Resume File'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingResume}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Section 2: Personal & Academic Info Form */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '1.5rem' }}>
              Education & Profile Details
            </h3>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={user?.name || ''} disabled style={{ background: 'var(--slate-100)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled style={{ background: 'var(--slate-100)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">College / University</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. National Institute of Technology"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course / Degree</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MCA, B.Tech, BCA"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 2026"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bengaluru, Karnataka"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Skills Tag Management */}
              <div className="form-group">
                <label className="form-label">Skills (Used for Rule-Based Job Matching)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add a skill (e.g. React, Python, UI/UX, SEO)..."
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

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '38px', padding: '0.5rem', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
                  {skills.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)', alignSelf: 'center' }}>
                      No skills added yet. Add skills to improve job match accuracy.
                    </span>
                  ) : (
                    skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'var(--primary-100)',
                          color: 'var(--primary-800)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary-700)' }}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio / About Yourself</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Share a brief overview of your background, interests, and availability..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={savingProfile} style={{ marginTop: '0.5rem' }}>
                <Save size={18} /> {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
