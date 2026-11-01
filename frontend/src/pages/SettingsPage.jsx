import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Coins,
  ShieldAlert,
  LogOut,
  Save,
  CheckCircle2,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

export const SettingsPage = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { theme, toggleTheme, currency, setCurrency, accentColor, setAccentColor, formatCurrency } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [selectedCurrency, setSelectedCurrency] = useState(currency || 'INR');
  const [saving, setSaving] = useState(false);

  // Danger Zone Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = 'Settings — SpendWise Preferences';
    if (user?.name) setName(user.name);
    if (user?.preferredCurrency) setSelectedCurrency(user.preferredCurrency);
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      showToast({ type: 'error', message: 'Name must be at least 2 characters long.' });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        preferredCurrency: selectedCurrency,
      });
      setCurrency(selectedCurrency);
      showToast({ type: 'success', message: 'Preferences updated successfully!' });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update preferences.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      showToast({
        type: 'info',
        message: 'Your account and all associated transactions have been deleted.',
      });
      navigate('/');
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete account.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="settings-workspace">
      {/* Header */}
      <div className="tx-header-wrap">
        <div>
          <h2>Account & Preferences</h2>
          <p>Manage your profile identity, currency formatting, interface aesthetics, and security.</p>
        </div>
      </div>

      {/* 1. Profile & Currency Configuration Card */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <User size={18} color="var(--accent-primary)" />
          <h3>User Profile & Localization</h3>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">
                Full Name
              </label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-email">
                Email Address (Account ID)
              </label>
              <input
                id="settings-email"
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span className="form-help">Bound to your account credentials.</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settings-currency">
              Display Currency
            </label>
            <select
              id="settings-currency"
              className="form-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
              <option value="USD">USD — Indian Rupee Standard (₹)</option>
            </select>
            <span className="form-help">
              Preview:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(125000, selectedCurrency)}
              </strong>{' '}
              • Changes currency symbol and notation across all tables and charts without altering stored amounts.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-profile-btn"
              disabled={saving}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Profile Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Appearance & Aesthetics Card */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <Palette size={18} color="var(--accent-primary)" />
          <h3>Interface Appearance & Aesthetic Theme</h3>
        </div>

        {/* Theme Mode Toggle (Dark/Light) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '0.95rem' }}>Interface Mode</strong>
            <p style={{ fontSize: '0.825rem', marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
              Currently active: <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{theme} Navy</strong> mode
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            id="toggle-theme-settings-btn"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            <span>Switch to {theme === 'light' ? 'Dark Navy' : 'Clean Light'}</span>
          </button>
        </div>

        {/* UI Accent Swatches (Emerald, Blue, Orange, Pink) */}
        <div>
          <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
            Fintech Accent Color
          </strong>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select your preferred accent highlight for buttons, focus rings, and visual telemetry:
          </p>

          <div className="swatch-grid">
            {/* Emerald (Signature Default) */}
            <div
              className={`swatch-card ${accentColor === 'emerald' ? 'active' : ''}`}
              onClick={() => {
                setAccentColor('emerald');
                showToast({ type: 'info', message: 'Accent set to Emerald Green (Signature).' });
              }}
              id="settings-theme-emerald-btn"
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Emerald
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {accentColor === 'emerald' ? 'Active' : 'Fintech'}
                </div>
              </div>
            </div>

            {/* Sky Blue */}
            <div
              className={`swatch-card ${accentColor === 'blue' ? 'active' : ''}`}
              onClick={() => {
                setAccentColor('blue');
                showToast({ type: 'info', message: 'Accent set to Sky Blue.' });
              }}
              id="settings-theme-blue-btn"
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Sky Blue
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {accentColor === 'blue' ? 'Active' : 'Classic'}
                </div>
              </div>
            </div>

            {/* Sunset Orange */}
            <div
              className={`swatch-card ${accentColor === 'orange' ? 'active' : ''}`}
              onClick={() => {
                setAccentColor('orange');
                showToast({ type: 'info', message: 'Accent set to Sunset Orange.' });
              }}
              id="settings-theme-orange-btn"
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#ea580c',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.4)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Sunset Orange
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {accentColor === 'orange' ? 'Active' : 'Warm'}
                </div>
              </div>
            </div>

            {/* Blossom Pink */}
            <div
              className={`swatch-card ${accentColor === 'pink' ? 'active' : ''}`}
              onClick={() => {
                setAccentColor('pink');
                showToast({ type: 'info', message: 'Accent set to Blossom Pink.' });
              }}
              id="settings-theme-pink-btn"
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#db2777',
                  boxShadow: '0 2px 6px rgba(219, 39, 119, 0.4)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Blossom Pink
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {accentColor === 'pink' ? 'Active' : 'Vibrant'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Account Data & Danger Zone */}
      <div className="danger-zone-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-danger)' }}>
          <ShieldAlert size={18} />
          <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--accent-danger)' }}>
            Data Management & Danger Zone
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Deleting your SpendWise account erases your profile, all historical income and expense transactions, and monthly budget limits. This operation is permanent and cannot be reversed.
        </p>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="btn btn-danger btn-sm"
          id="delete-account-btn"
        >
          <ShieldAlert size={15} />
          <span>Permanently Delete Account</span>
        </button>
      </div>

      {/* Confirm Delete Account Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Permanently Delete Account"
        message="Are you completely sure? All your financial transactions, category budgets, and account records will be permanently erased."
        confirmText="Yes, Permanently Delete"
        confirmBtnStyle="btn-danger"
        loading={deleteLoading}
        onConfirm={handleDeleteAccountConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
