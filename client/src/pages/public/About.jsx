import React from 'react';
import { Briefcase, Code, Database, Shield, CheckCircle, Sparkles, Server } from 'lucide-react';

const About = () => {
  return (
    <div style={{ padding: '3.5rem 0', minHeight: '80vh', background: 'var(--slate-50)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              background: 'var(--primary-100)',
              color: 'var(--primary-800)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
          >
            MCA Mini Project
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--slate-900)', marginTop: '0.75rem' }}>
            About PartTimeConnect
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            A Modern Student Part-Time Job Portal built on the MERN Stack
          </p>
        </div>

        {/* Overview Card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--slate-900)' }}>
            Project Mission & Objectives
          </h2>
          <p style={{ color: 'var(--slate-700)', lineHeight: '1.8', marginBottom: '1.25rem' }}>
            PartTimeConnect was conceived and architected as an academic MCA Mini Project to address a real-world dilemma: college students frequently struggle to find legitimate, flexible part-time and internship opportunities that accommodate their class schedules, while local and digital employers struggle to discover eager, tech-savvy student talent.
          </p>
          <p style={{ color: 'var(--slate-700)', lineHeight: '1.8' }}>
            Unlike generic job portals with paid subscriptions and overwhelming full-time requirements, PartTimeConnect focuses 100% on student-friendly flexible work modes (Remote, Hybrid, On-Site), transparent monthly stipends, and an intelligent rule-based skill recommendation engine.
          </p>
        </div>

        {/* Architecture Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Code size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Full-Stack MERN</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Built strictly on MongoDB, Express.js, React.js (Vite), and Node.js without relying on paid third-party APIs.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Strict Role-Based Security</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Multi-role authorization protects Students, Employers, and Admins. Resumes are stored privately with zero public directory exposure.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Rule-Based Match Engine</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Calculates transparent match percentages, highlighting matching and missing skills based on student profiles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
