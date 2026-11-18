import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Shield, HelpCircle, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid var(--slate-200)', marginTop: 'auto' }}>
      <div className="container" style={{ padding: '3.5rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand Info */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '1rem' }}>
              <div className="brand-icon">
                <Briefcase size={20} />
              </div>
              <span>PartTime<span style={{ color: 'var(--primary-600)' }}>Connect</span></span>
            </div>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              The dedicated student-first part-time job & internship platform built with the MERN Stack. Empowering college students to gain practical industry experience while balancing studies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/jobs" style={{ color: 'var(--slate-600)' }}>Browse All Jobs</Link></li>
              <li><Link to="/register" style={{ color: 'var(--slate-600)' }}>Student Registration</Link></li>
              <li><Link to="/register?role=employer" style={{ color: 'var(--slate-600)' }}>Post a Part-Time Job</Link></li>
              <li><Link to="/login" style={{ color: 'var(--slate-600)' }}>Sign In to Portal</Link></li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Information
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/about" style={{ color: 'var(--slate-600)' }}>About Project</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--slate-600)' }}>Help & Support</Link></li>
              <li><span style={{ color: 'var(--slate-500)' }}>Role-Based Access Control</span></li>
              <li><span style={{ color: 'var(--slate-500)' }}>Rule-Based Match Engine</span></li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Academic Project
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              <p><strong>Project:</strong> MCA Mini Project</p>
              <p><strong>Stack:</strong> React, Vite, Node.js, Express, MongoDB</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color="var(--primary-600)" /> Secure JWT & RBAC
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
          <p>© {new Date().getFullYear()} PartTimeConnect – MCA Mini Project. Free & Open Source.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with <Heart size={14} color="#ef4444" fill="#ef4444" /> for Student Careers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
