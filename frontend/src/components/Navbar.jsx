import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User,
  ShieldCheck,
  Bell,
  AlertTriangle,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { showToast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

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

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Executive Overview';
      case '/transactions':
        return 'Transaction Ledger';
      case '/budgets':
        return 'Spending Controls';
      case '/reports':
        return 'Financial Analytics';
      case '/settings':
        return 'Account & Preferences';
      default:
        return 'Financial Hub';
    }
  };

  return (
    <>
      <header className="navbar" role="banner" aria-label="Main Navigation">
        <div className="nav-container">
          {/* Left: Mobile Toggle & Brand */}
          <div className="nav-left">
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="icon-button mobile-menu-toggle"
                id="mobile-menu-btn"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={20} />
              </button>
            )}

            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="nav-brand"
              id="nav-logo"
              aria-label="SpendWise Home"
              onClick={closeMobileMenu}
            >
              <div className="nav-logo-icon">
                <Wallet size={19} />
              </div>
              <span className="brand-title">SpendWise</span>
            </Link>

            {isAuthenticated && (
              <div className="nav-breadcrumb-tag" aria-hidden="true">
                <span className="breadcrumb-slash">/</span>
                <span className="breadcrumb-label">{getPageTitle(location.pathname)}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links for authenticated users (shows on tablet/desktop if sidebar collapsed or top nav mode) */}
          {isAuthenticated && (
            <nav className="nav-links-desktop" aria-label="Desktop Navigation Links">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-dashboard"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-transactions"
              >
                <ArrowLeftRight size={16} />
                <span>Transactions</span>
              </NavLink>
              <NavLink
                to="/budgets"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-budgets"
              >
                <Target size={16} />
                <span>Budgets</span>
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-reports"
              >
                <BarChart3 size={16} />
                <span>Reports</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-link-settings"
              >
                <Settings size={16} />
                <span>Settings</span>
              </NavLink>
            </nav>
          )}

          {/* Right Action Icons & Theme Color Switcher */}
          <div className="nav-actions">
            {/* Accent Palette Selector: Emerald (Default), Blue, Orange, Pink */}
            <div className="accent-picker-group" title="Select Interface Accent Theme" role="group" aria-label="Accent theme switcher">
              <button
                type="button"
                className={`accent-pill-btn ${accentColor === 'emerald' ? 'active' : ''}`}
                onClick={() => setAccentColor('emerald')}
                id="accent-btn-emerald"
                aria-label="Emerald theme"
                title="Emerald Theme (Default)"
              >
                <span className="accent-dot emerald" />
                <span className="accent-label">Emerald</span>
              </button>
              <button
                type="button"
                className={`accent-pill-btn ${accentColor === 'blue' ? 'active' : ''}`}
                onClick={() => setAccentColor('blue')}
                id="accent-btn-blue"
                aria-label="Sky Blue theme"
                title="Sky Blue Theme"
              >
                <span className="accent-dot blue" />
                <span className="accent-label">Blue</span>
              </button>
              <button
                type="button"
                className={`accent-pill-btn ${accentColor === 'orange' ? 'active' : ''}`}
                onClick={() => setAccentColor('orange')}
                id="accent-btn-orange"
                aria-label="Sunset Orange theme"
                title="Sunset Orange Theme"
              >
                <span className="accent-dot orange" />
                <span className="accent-label">Orange</span>
              </button>
              <button
                type="button"
                className={`accent-pill-btn ${accentColor === 'pink' ? 'active' : ''}`}
                onClick={() => setAccentColor('pink')}
                id="accent-btn-pink"
                aria-label="Blossom Pink theme"
                title="Blossom Pink Theme"
              >
                <span className="accent-dot pink" />
                <span className="accent-label">Pink</span>
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
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {isAuthenticated ? (
              <div className="nav-user-actions">
                {/* Notification Centre Bell & Dropdown */}
                <div className="notif-wrapper" ref={notifDropdownRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`icon-button notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                    id="nav-notifications-btn"
                    aria-label={`Notifications (${unreadCount} unread)`}
                    title="Budget & system alerts"
                  >
                    <Bell size={17} />
                    {unreadCount > 0 && (
                      <span className="notif-badge" id="nav-notif-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="notif-dropdown-popover" role="dialog" aria-label="Notifications panel">
                      <div className="notif-dropdown-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="badge badge-warning" style={{ fontSize: '0.675rem', padding: '1px 6px' }}>
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="notif-mark-all-btn"
                            id="notif-mark-all-btn"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="notif-dropdown-body">
                        {notifications.length === 0 ? (
                          <div className="notif-empty-state">
                            <ShieldCheck size={28} color="var(--accent-primary)" style={{ margin: '0 auto 0.5rem' }} />
                            <strong>All Clear</strong>
                            <p>No notifications. Your budgets are healthy.</p>
                          </div>
                        ) : (
                          <div className="notif-list">
                            {notifications.map((n) => (
                              <div
                                key={n._id}
                                className={`notif-item ${!n.isRead ? 'unread' : 'read'}`}
                                onClick={() => !n.isRead && markAsRead(n._id)}
                                role="button"
                                tabIndex={0}
                              >
                                <div className={`notif-item-icon ${n.type || 'info'}`}>
                                  {n.type === 'exceeded' && <AlertCircle size={15} />}
                                  {n.type === 'warning' && <AlertTriangle size={15} />}
                                  {n.type === 'limit_reached' && <Target size={15} />}
                                  {(!n.type || n.type === 'info') && <Bell size={15} />}
                                </div>
                                <div className="notif-item-content">
                                  <div className="notif-item-title-row">
                                    <strong className="notif-item-title">{n.title}</strong>
                                    <span className="notif-item-time">{formatRelativeTime(n.createdAt)}</span>
                                  </div>
                                  <p className="notif-item-message">{n.message}</p>
                                </div>
                                {!n.isRead && <span className="notif-unread-dot" title="Unread" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/settings"
                  className="icon-button"
                  id="nav-user-profile-btn"
                  title={`Logged in as ${user?.name}`}
                  aria-label="User Profile"
                >
                  <User size={17} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="icon-button logout-btn"
                  id="nav-logout-btn"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="auth-btn-group">
                <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="nav-logo-icon" style={{ width: '30px', height: '30px' }}>
              <Wallet size={16} />
            </div>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              SpendWise
            </strong>
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
            <div className="mobile-drawer-user-info">
              <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {user?.email}
              </div>
            </div>

            <nav className="mobile-drawer-links" style={{ flex: 1 }}>
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
                <Target size={18} />
                <span>Budgets</span>
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <BarChart3 size={18} />
                <span>Reports & Analytics</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Settings size={18} />
                <span>Settings</span>
              </NavLink>
            </nav>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-block"
                style={{ color: 'var(--accent-danger)' }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
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
