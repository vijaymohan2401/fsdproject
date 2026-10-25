import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const { login, demoLogin, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    document.title = 'Sign In — SpendWise';
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      showToast({ type: 'success', message: 'Signed in successfully! Welcome back.' });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      showToast({
        type: 'success',
        message: 'Signed in as Demo Student with sample data!',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        minHeight: '75vh',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            className="nav-logo-icon"
            style={{ margin: '0 auto 0.75rem', width: '44px', height: '44px' }}
          >
            <Wallet size={24} />
          </div>
          <h2>Sign In to SpendWise</h2>
          <p style={{ marginTop: '0.35rem' }}>
            Enter your credentials to access your financial dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.85rem',
              backgroundColor: 'var(--accent-danger-light)',
              color: 'var(--accent-danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Login for Viva / Examiner */}
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem',
            backgroundColor: 'var(--accent-primary-light)',
            border: '1px dashed var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={16} />
            <span>FSD-2 College Lab Evaluator / Quick Demo</span>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            className="btn btn-primary btn-sm btn-block"
            id="demo-login-btn"
          >
            {demoLoading ? 'Logging In...' : '1-Click Instant Demo Login'}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ padding: '0 0.75rem' }}>Or sign in with email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address *
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password *
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-secondary btn-block"
            id="login-submit-btn"
            disabled={loading || demoLoading}
            style={{ marginTop: '0.5rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}
        >
          Don't have an account yet?{' '}
          <Link to="/register" id="link-to-register" style={{ fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
