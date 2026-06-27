import React, { useState } from 'react';
import { Shield, Key, Mail, AlertTriangle } from 'lucide-react';
import { loginUser } from '../utils/mockDb';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations (simulate frontend validation like Zod/Formik)
    if (!email) {
      setError('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email, password);
      onLoginSuccess(result.user, result.token);
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      setLoading(false);
    }
  };


  return (
    <div className="login-screen" style={styles.screen}>
      <div className="glass-panel-neon animate-slide-in" style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logoWrapper}>
            <Shield size={32} color="#8B5CF6" />
          </div>
          <h2 style={styles.title}>Real-Time Project Task Management</h2>
          <p style={styles.subtitle}>Collaborative Project Management Suite</p>
        </div>

        {error && (
          <div style={styles.errorAlert} className="animate-fade-in">
            <AlertTriangle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Key size={16} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    background: 'radial-gradient(ellipse at bottom, #0d122b 0%, #030712 100%)',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    padding: '36px 30px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoWrapper: {
    display: 'inline-flex',
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    marginBottom: '14px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#FCA5A5',
    fontSize: '13px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  input: {
    paddingLeft: '36px',
  },
  submitBtn: {
    marginTop: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0 16px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    padding: '0 10px',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
  },
  presetsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  presetBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
    cursor: 'pointer',
    width: '100%',
  },
  presetRole: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  presetUser: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
};
