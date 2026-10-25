import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = '404 - Page Not Found — SpendWise';
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-warning-light)',
          color: 'var(--accent-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <HelpCircle size={40} />
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
        Page Not Found
      </h2>
      <p style={{ maxWidth: '460px', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        The page you are looking for doesn't exist, has been moved, or the link may be
        broken.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="btn btn-primary"
          id="notfound-home-btn"
        >
          <Home size={18} />
          <span>{isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}</span>
        </Link>
      </div>
    </div>
  );
};
