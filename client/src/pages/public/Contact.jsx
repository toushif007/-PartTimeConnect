import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, HelpCircle } from 'lucide-react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div style={{ padding: '3.5rem 0', minHeight: '80vh', background: 'var(--slate-50)' }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Contact & Support
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            Have questions regarding PartTimeConnect or looking for assistance? Reach out to us.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Contact Details Card */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--slate-900)' }}>
              Project Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>Project Contact</h4>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>support@parttimeconnect.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>Academic Institution</h4>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Master of Computer Applications (MCA) Mini Project</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>Demo Help</h4>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                    Use the 1-click quick credentials buttons on the login page for instant role demonstrations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--slate-900)' }}>
              Send an Inquiry
            </h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontWeight: '800', color: 'var(--slate-900)' }}>Message Received!</h4>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Thank you for your feedback. We will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Toushif Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Inquiring about part-time job verification"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    rows="4"
                    required
                    className="form-textarea"
                    placeholder="Write your query here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
