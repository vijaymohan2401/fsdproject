import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Palette,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showToast({ type: 'success', message: 'You have been logged out successfully.' });
      setMobileMenuOpen(false);
      navigate('/login');
    } catch {
      showToast({ type: 'error', message: 'Failed to log out. Please try again.' });
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main Navigation">
        <div className="nav-container">
          {/* Clickable Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="nav-brand"
            id="nav-logo"
            aria-label="SpendWise Home"
            onClick={closeMobileMenu}
          >
            <div className="nav-logo-icon">
              <Wallet size={20} />
            </div>
            <span>SpendWise</span>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <div className="nav-links-desktop">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-dashboard"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-transactions"
              >
                <ArrowLeftRight size={18} />
                <span>Transactions</span>
              </NavLink>
              <NavLink
                to="/budgets"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-budgets"
              >
                <PieChart size={18} />
                <span>Budgets</span>
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-reports"
              >
                <BarChart3 size={18} />
                <span>Reports</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-settings"
              >
                <Settings size={18} />
                <span>Settings</span>
              </NavLink>
            </div>
          )}

          {/* Right Action Icons & Theme Color Switcher */}
          <div className="nav-actions">
            {/* Color Accent Picker: Light Blue, Orange, Pink */}
            <div className="accent-picker-group" title="Select UI Accent Theme">
              <button
                type="button"
                className={`accent-pill-btn ${accentColor === 'blue' ? 'active' : ''}`}
                onClick={() => setAccentColor('blue')}
                id="accent-btn-blue"
                aria-label="Light Blue theme"
                title="Light Blue Theme"
              >
                <span className="accent-dot blue" />
                <span style={{ fontSize: '0.75rem' }}>Blue</span>
              </button>
              <button
                type="button"
                className={`accent-pill-btn ${accentColor === 'orange' ? 'active' : ''}`}
                onClick={() => setAccentColor('orange')}
                id="accent-btn-orange"
                aria-label="Orange theme"
                title="Sunset Orange Theme"
              >
                <span className="accent-dot orange" />
                <span style={{ fontSize: '0.75rem' }}>Orange</span>
              </button>
              <button
                type="button"
                className={`accent-pill-btn ${accentColor === 'pink' ? 'active' : ''}`}
                onClick={() => setAccentColor('pink')}
                id="accent-btn-pink"
                aria-label="Pink theme"
                title="Blossom Pink Theme"
              >
                <span className="accent-dot pink" />
                <span style={{ fontSize: '0.75rem' }}>Pink</span>
              </button>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="icon-button"
              id="theme-toggle-btn"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/settings"
                  className="icon-button"
                  id="nav-user-profile-btn"
                  title={`Logged in as ${user?.name}`}
                  aria-label="User Profile"
                >
                  <User size={18} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="icon-button"
                  id="nav-logout-btn"
                  title="Log out"
                  aria-label="Log out"
                  style={{ color: 'var(--accent-danger)' }}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="icon-button mobile-menu-toggle"
                id="mobile-menu-btn"
                aria-label="Open mobile menu"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Nav Drawer */}
      <aside
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
      >
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="nav-logo-icon" style={{ width: '28px', height: '28px' }}>
              <Wallet size={16} />
            </div>
            <strong style={{ fontFamily: 'var(--font-display)' }}>SpendWise</strong>
          </div>
          <button
            onClick={closeMobileMenu}
            className="icon-button"
            id="close-mobile-menu-btn"
            aria-label="Close mobile menu"
          >
            <X size={18} />
          </button>
        </div>

        {isAuthenticated ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-hover)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {user?.email}
              </div>
            </div>

            <NavLink
              to="/dashboard"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <ArrowLeftRight size={18} />
              <span>Transactions</span>
            </NavLink>
            <NavLink
              to="/budgets"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <PieChart size={18} />
              <span>Budgets</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <BarChart3 size={18} />
              <span>Reports</span>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>

            {/* Mobile Color Accent Picker */}
            <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                UI Accent Theme
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${accentColor === 'blue' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => setAccentColor('blue')}
                >
                  <span className="accent-dot blue" style={{ marginRight: '4px' }} /> Light Blue
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${accentColor === 'orange' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => setAccentColor('orange')}
                >
                  <span className="accent-dot orange" style={{ marginRight: '4px' }} /> Orange
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${accentColor === 'pink' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => setAccentColor('pink')}
                >
                  <span className="accent-dot pink" style={{ marginRight: '4px' }} /> Pink
                </button>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-block"
                id="mobile-logout-btn"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/login"
              className="btn btn-secondary btn-block"
              onClick={closeMobileMenu}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn btn-primary btn-block"
              onClick={closeMobileMenu}
            >
              Get Started
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};
