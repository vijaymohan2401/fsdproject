import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
  ArrowRight,
  Download,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'SpendWise — Smart Expense Tracking & Budget Insights';
  }, []);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 1rem 3rem',
          maxWidth: '850px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-primary-light)',
            color: 'var(--accent-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <Wallet size={16} />
          <span>FSD-2 Full-Stack Engineering Project</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '1.25rem',
            color: 'var(--text-primary)',
          }}
        >
          Take Control of Your Spending with{' '}
          <span style={{ color: 'var(--accent-primary)' }}>SpendWise</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '2rem',
          }}
        >
          Stop wondering where your money went. SpendWise gives students and young adults a
          centralized, database-backed dashboard to record expenses, set monthly budgets, and
          visualize spending trends.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="btn btn-primary btn-lg"
            id="hero-get-started-btn"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
            <ArrowRight size={18} />
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="btn btn-secondary btn-lg"
              id="hero-sign-in-btn"
            >
              Sign In to Account
            </Link>
          )}
        </div>
      </section>

      {/* Live Visual Teaser Card */}
      <section style={{ maxWidth: '960px', margin: '0 auto 4rem' }}>
        <div
          className="card"
          style={{
            padding: '1.75rem',
            background:
              'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-hover) 100%)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-danger)',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-warning)',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
              <span
                style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                SpendWise Real-Time Analytics Dashboard Preview
              </span>
            </div>
            <span className="badge badge-income">● System Live</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total Income (Oct)
              </span>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--accent-income)',
                }}
              >
                ₹18,500.00
              </div>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total Expenses (Oct)
              </span>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--accent-expense)',
                }}
              >
                ₹6,499.00
              </div>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Net Available Balance
              </span>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--accent-blue)',
                }}
              >
                ₹12,001.00
              </div>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Budget Remaining
              </span>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--accent-warning)',
                }}
              >
                ₹3,501.00 (65%)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2>Designed for Simplicity and Reliability</h2>
          <p style={{ marginTop: '0.5rem' }}>
            Built strictly on authentic full-stack technologies with no mock smoke-and-mirrors.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div className="card">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <TrendingUp size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Income & Expense Tracking</h3>
            <p>
              Log stipends, pocket money, freelance income, and daily expenses with exact
              dates, categories, and notes. Filter and sort with ease.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-warning-light)',
                color: 'var(--accent-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <PieChart size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Intelligent Budget Limits</h3>
            <p>
              Set overall monthly budgets and category caps. Automatic alerts notify you at
              80% threshold and highlight when spending exceeds 100%.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-blue-light)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Sliders size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Visual Reports & Trends</h3>
            <p>
              Interactive SVG charts reveal category breakdowns, month-over-month percentage
              shifts, and 6-month historical spending curves.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Download size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Safe CSV Data Export</h3>
            <p>
              Export your transaction records anytime with built-in CSV formula injection
              sanitization protecting spreadsheet applications.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-blue-light)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Secure Cookie Sessions</h3>
            <p>
              Bcrypt password hashing with salted rounds and HttpOnly session cookies ensure
              your private financial records remain strictly confidential.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Full-Stack MERN Architecture</h3>
            <p>
              Designed explicitly with clear MVC separation, REST endpoints, MongoDB
              schemas, React hooks, and an accompanying TypeScript companion module.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section style={{ maxWidth: '800px', margin: '0 auto 3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h4 style={{ marginBottom: '0.4rem' }}>How does SpendWise calculate my available balance?</h4>
            <p>
              SpendWise computes your net balance as <code>Total Income - Total Expenses</code> for
              the selected period. It derives calculations directly from database transactions rather
              than arbitrary estimations.
            </p>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: '0.4rem' }}>Can I test the application without creating an account?</h4>
            <p>
              Yes! You can use the "Demo Login" button on the sign-in page to instantly test all
              features with pre-loaded student financial records.
            </p>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: '0.4rem' }}>What happens when I exceed my budget?</h4>
            <p>
              SpendWise marks budgets reaching 80% with an amber warning badge. When your spending
              crosses 100%, an accessible red exceeded alert is triggered on both the dashboard and
              budgets page.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section
        style={{
          maxWidth: '850px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface)',
          padding: '3rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h2 style={{ marginBottom: '0.75rem' }}>Ready to organize your finances?</h2>
        <p style={{ maxWidth: '560px', margin: '0 auto 1.5rem' }}>
          Join SpendWise today to experience seamless expense tracking and budget intelligence.
        </p>
        <Link
          to={isAuthenticated ? '/dashboard' : '/register'}
          className="btn btn-primary btn-lg"
          id="cta-register-btn"
        >
          {isAuthenticated ? 'Open Dashboard' : 'Create Free Account'}
        </Link>
      </section>
    </div>
  );
};
