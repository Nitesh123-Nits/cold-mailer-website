import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Send, Upload, FileText, CheckCircle, AlertCircle, 
  Loader2, Users, User, FileSpreadsheet, HelpCircle, 
  ShieldCheck, Sun, Moon, Sparkles, UserCircle, Eye
} from 'lucide-react';

const templates = [
  {
    id: 'standard',
    name: 'Professional',
    subject: 'Application for {role} - {hrName}',
    body: 'Dear {hrName},\n\nI hope you are having a productive week.\n\nI am reaching out to express my keen interest in the {role} position. With {experience} years of experience and a strong background in {skills}, I am confident that I can contribute effectively to your team.\n\nI have attached my resume for your review and would appreciate the opportunity to discuss my application further.\n\nBest regards,\n{myName}'
  },
  {
    id: 'passionate',
    name: 'Enthusiastic',
    subject: 'Excited to apply for {role} role!',
    body: 'Hi {hrName},\n\nI have been following your company\'s work for a while and am a huge fan of your recent projects. I am thrilled to see an opening for {role} and would love to bring my {experience} years of expertise to your innovative team.\n\nMy core skills include {skills}, and I am eager to apply them to help achieve your goals.\n\nThank you for considering my application!\n\nCheers,\n{myName}'
  },
  {
    id: 'discovery',
    name: 'Opening Discovery',
    subject: 'Inquiry regarding {role} opening',
    body: 'Hi {hrName},\n\nI recently came across the opening for the {role} position at your company and was immediately drawn to the opportunity. Given my {experience} years of experience in {skills}, I believe I would be a great fit for the team.\n\nI’ve attached my resume for your consideration and would love to hear more about the role and how I can contribute to your company\'s success.\n\nBest,\n{myName}'
  },
  {
    id: 'problem-solver',
    name: 'Problem Solver',
    subject: 'Solving {role} challenges at your company',
    body: 'Dear {hrName},\n\nGreat teams are built on solid technical foundations. As someone with {experience} years of experience in {skills}, I specialize in solving the exact types of challenges your company is currently tackling in the {role} domain.\n\nI’ve attached my resume which details my past successes. I’d love to show you how I can bring similar value to your current projects.\n\nLooking forward to hearing from you,\n{myName}'
  }
];

function App() {
  const [mode, setMode] = useState('single');
  const [showGuide, setShowGuide] = useState(false);
  const [theme, setTheme] = useState('light');
  const [formData, setFormData] = useState({
    hrEmail: '',
    hrName: '',
    myName: '',
    role: '',
    experience: '',
    skills: '',
    subject: templates[0].subject,
    body: templates[0].body
  });
  const [resume, setResume] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }));
  };

  const previewEmail = useMemo(() => {
    const { hrName, myName, role, experience, skills, body } = formData;
    return body
      .replace(/{hrName}/g, hrName || '[HR Name]')
      .replace(/{myName}/g, myName || '[Your Name]')
      .replace(/{role}/g, role || '[Role]')
      .replace(/{experience}/g, experience || '[X]')
      .replace(/{skills}/g, skills || '[Skills]');
  }, [formData]);

  const previewSubject = useMemo(() => {
    const { hrName, role, subject } = formData;
    return subject
      .replace(/{hrName}/g, hrName || '[HR Name]')
      .replace(/{role}/g, role || '[Role]');
  }, [formData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
      setStatus({ type: '', message: '' });
    } else {
      setStatus({ type: 'error', message: 'Please upload a PDF file' });
    }
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setBulkFile(file);
      setStatus({ type: '', message: '' });
    } else {
      setStatus({ type: 'error', message: 'Please upload a CSV file' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const data = new FormData();
    data.append('mode', mode);
    data.append('myName', formData.myName);
    data.append('subject', formData.subject);
    data.append('body', formData.body);
    if (resume) data.append('resume', resume);

    if (mode === 'single') {
      data.append('hrEmail', formData.hrEmail);
      data.append('hrName', formData.hrName);
      data.append('role', formData.role);
      data.append('experience', formData.experience);
      data.append('skills', formData.skills);
    } else {
      if (!bulkFile) {
        setStatus({ type: 'error', message: 'Please upload a CSV file' });
        setLoading(false);
        return;
      }
      data.append('bulkFile', bulkFile);
      data.append('role', formData.role);
      data.append('experience', formData.experience);
      data.append('skills', formData.skills);
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/send-email`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: response.data.message });
      if (mode === 'single') setFormData(prev => ({ ...prev, hrEmail: '', hrName: '' }));
      setResume(null);
      setBulkFile(null);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to send emails. Check connection.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container">
        <header>
          <div className="flex-between">
            <div className="logo-group">
              <h1>Cold Outreach Pro</h1>
              <p className="subtitle">Landed your dream job with personalized cold emails.</p>
            </div>
            <div className="header-actions">
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button className="guide-toggle" onClick={() => setShowGuide(!showGuide)}>
                <HelpCircle size={20} /> How to Use
              </button>
            </div>
          </div>
        </header>

        {showGuide && (
          <section className="guide-section card">
            <h2><ShieldCheck size={24} /> Quick Setup Guide</h2>
            <div className="guide-grid">
              <div className="guide-item">
                <div className="guide-icon"><FileText size={20} /></div>
                <h3>1. Config</h3>
                <p>Use Gmail <strong>App Password</strong> in <code>.env</code>.</p>
              </div>
              <div className="guide-item">
                <div className="guide-icon"><User size={20} /></div>
                <h3>2. Single</h3>
                <p>Personalize for higher response rates!</p>
              </div>
              <div className="guide-item">
                <div className="guide-icon"><Users size={20} /></div>
                <h3>3. Bulk</h3>
                <p>Upload CSV with <code>Name,Email</code> columns.</p>
              </div>
              <div className="guide-item">
                <div className="guide-icon"><Sparkles size={20} /></div>
                <h3>4. Templates</h3>
                <p>Use <code>{`{myName}, {hrName}, {role}`}</code> etc. as placeholders.</p>
              </div>
            </div>
            <button className="btn-close-guide" onClick={() => setShowGuide(false)}>Got it!</button>
          </section>
        )}

        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'single' ? 'active' : ''}`}
            onClick={() => setMode('single')}
          >
            <User size={18} /> Single Outreach
          </button>
          <button 
            className={`mode-btn ${mode === 'bulk' ? 'active' : ''}`}
            onClick={() => setMode('bulk')}
          >
            <Users size={18} /> Bulk Outreach
          </button>
        </div>

        <div className="main-layout">
          <section className="card main-card">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Your Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <UserCircle size={20} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" name="myName" placeholder="e.g. Nitesh Kumar Sah"
                      style={{ paddingLeft: '3rem' }}
                      value={formData.myName} onChange={handleInputChange} required
                    />
                  </div>
                </div>

                {mode === 'single' ? (
                  <>
                    <div className="input-group">
                      <label>HR Name</label>
                      <input 
                        type="text" name="hrName" placeholder="Sarah Johnson"
                        value={formData.hrName} onChange={handleInputChange} required
                      />
                    </div>
                    <div className="input-group">
                      <label>HR Email</label>
                      <input 
                        type="email" name="hrEmail" placeholder="hr@company.com"
                        value={formData.hrEmail} onChange={handleInputChange} required
                      />
                    </div>
                  </>
                ) : (
                  <div className="input-group full-width">
                    <label>Bulk Recipients (CSV)</label>
                    <div 
                      className="upload-zone bulk-zone"
                      onClick={() => bulkFileInputRef.current.click()}
                    >
                      <input 
                        type="file" ref={bulkFileInputRef} onChange={handleBulkFileChange}
                        accept=".csv" style={{ display: 'none' }}
                      />
                      {bulkFile ? (
                        <div className="flex-center">
                          <FileSpreadsheet className="upload-icon" />
                          <p>{bulkFile.name}</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="upload-icon" />
                          <p>Upload CSV (Format: name, email)</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label>Applying Role</label>
                  <input 
                    type="text" name="role" placeholder="Frontend Developer"
                    value={formData.role} onChange={handleInputChange} required
                  />
                </div>

                <div className="input-group">
                  <label>Years of Experience</label>
                  <input 
                    type="number" name="experience" placeholder="5"
                    value={formData.experience} onChange={handleInputChange}
                  />
                </div>

                <div className="input-group full-width">
                  <label>Key Skills (comma separated)</label>
                  <textarea 
                    name="skills" placeholder="React, Node.js, AWS"
                    value={formData.skills} onChange={handleInputChange}
                  />
                </div>

                <div className="input-group full-width">
                  <label>Choose a Template</label>
                  <div className="template-selector">
                    {templates.map(t => (
                      <button 
                        key={t.id} 
                        type="button"
                        className={`template-btn ${formData.subject === t.subject ? 'active' : ''}`}
                        onClick={() => selectTemplate(t)}
                      >
                        <Sparkles size={16} /> {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group full-width">
                  <label>Email Subject</label>
                  <input 
                    type="text" name="subject" placeholder="Email Subject"
                    value={formData.subject} onChange={handleInputChange} required
                  />
                </div>

                <div className="input-group full-width">
                  <label>Email Body (Use {`{hrName}, {role}, {experience}, {skills}, {myName}`} as placeholders)</label>
                  <textarea 
                    name="body" placeholder="Email Body"
                    style={{ minHeight: '200px' }}
                    value={formData.body} onChange={handleInputChange} required
                  />
                </div>

                <div className="input-group full-width">
                  <label>Resume (PDF)</label>
                  <div 
                    className="upload-zone"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <input 
                      type="file" ref={fileInputRef} onChange={handleFileChange}
                      accept=".pdf" style={{ display: 'none' }}
                    />
                    {resume ? (
                      <div className="flex-center">
                        <FileText className="upload-icon" />
                        <p>{resume.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="upload-icon" />
                        <p>Upload PDF Resume</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-send" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {mode === 'bulk' ? 'Launch Campaign' : 'Send Email'}
                  </>
                )}
              </button>

              {status.message && (
                <div className={`status ${status.type}`}>
                  {status.message}
                </div>
              )}
            </form>
          </section>

          <section className="preview-panel card">
            <h2><Eye size={22} /> Live Preview</h2>
            <div className="preview-content">
              <div className="preview-subject">
                <strong>Subject:</strong> {previewSubject}
              </div>
              <div className="preview-body">
                {previewEmail.split('\n').map((line, i) => (
                  <p key={i}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
            <div className="preview-hint">
              <Sparkles size={14} /> This is a live preview. All placeholders will be replaced before sending.
            </div>
          </section>
        </div>

        <footer style={{ marginTop: '3rem', textAlign: 'center', fontWeight: 'bold' }}>
          Cold Outreach Pro &copy; 2026
        </footer>
      </main>
    </div>
  );
}

export default App;
