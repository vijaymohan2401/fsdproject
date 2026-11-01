import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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
  PlusCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const Sidebar = ({ onQuickAdd }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showToast({ type: 'success', message: 'Logged out successfully.' });
      navigate('/login');
    } catch {
      showToast({ type: 'error', message: 'Failed to log out.' });
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, badge: null },
    { to: '/budgets', label: 'Budgets', icon: Target, badge: null },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { to: '/settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const getInitials = (name) => {
    if (!name) return 'SW';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <aside className="app-sidebar" aria-label="Application Sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-wrap">
        <Link to="/dashboard" className="sidebar-brand" aria-label="SpendWise Dashboard">
          <div className="brand-icon">
            <Wallet size={20} />
          </div>
          <div className="brand-meta">
            <span className="brand-name">SpendWise</span>
            <span className="brand-badge">PRO FINTECH</span>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      {onQuickAdd && (
        <div className="sidebar-quick-action">
          <button
            onClick={onQuickAdd}
            className="btn btn-primary btn-block sidebar-add-btn"
            id="sidebar-quick-tx-btn"
          >
            <PlusCircle size={16} />
            <span>New Transaction</span>
          </button>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to} className="sidebar-nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                  id={`sidebar-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  <ChevronRight size={14} className="nav-arrow" />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer with User Card */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name" title={user?.name}>
              {user?.name || 'Account User'}
            </div>
            <div className="user-email" title={user?.email}>
              {user?.email || 'user@spendwise.edu'}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="icon-button user-action-btn"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button
            onClick={handleLogout}
            className="icon-button user-action-btn logout-btn"
            aria-label="Log out of SpendWise"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

