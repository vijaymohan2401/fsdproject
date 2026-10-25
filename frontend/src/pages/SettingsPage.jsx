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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

export const SettingsPage = () => {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const { theme, toggleTheme, currency, setCurrency, accentColor, setAccentColor } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [selectedCurrency, setSelectedCurrency] = useState(currency || 'INR');
  const [saving, setSaving] = useState(false);

  // Danger Zone Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = 'Account Settings — SpendWise';
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
      showToast({ type: 'success', message: 'Profile preferences updated successfully!' });
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2>Account & Application Settings</h2>
        <p style={{ marginTop: '0.2rem' }}>
          Manage your personal details, display preferences, and account security.
        </p>
      </div>

      {/* Profile & Currency Preferences Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--accent-primary)" />
            <h3 className="card-title">User Profile</h3>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit}>
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
              Email Address (Login ID)
            </label>
            <input
              id="settings-email"
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
            <span className="form-help">
              Email is permanently bound to your account for identity security.
            </span>
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
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
            </select>
            <span className="form-help">
              Note: Changing preferred currency alters display symbols and formatting. It
              does not convert stored historical amounts using invented exchange rates.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-profile-btn"
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Appearance & Theme Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {theme === 'dark' ? (
              <Moon size={20} color="var(--accent-warning)" />
            ) : (
              <Sun size={20} color="var(--accent-warning)" />
            )}
            <h3 className="card-title">Appearance & Theme</h3>
          </div>
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
            <strong>Interface Mode</strong>
            <p style={{ fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Currently active: <strong style={{ textTransform: 'capitalize' }}>{theme}</strong> mode
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            id="toggle-theme-settings-btn"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
          </button>
        </div>

        {/* UI Accent Palette Selection (Light Blue / Orange / Pink) */}
        <div>
          <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
            UI Accent Color Theme
          </strong>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Choose your preferred aesthetic highlight color across buttons, charts, badges, and focus borders.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {/* Light Blue Option */}
            <button
              type="button"
              onClick={() => {
                setAccentColor('blue');
                showToast({ type: 'info', message: 'Theme accent changed to Light Sky Blue.' });
              }}
              className="card"
              style={{
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: accentColor === 'blue' ? '2px solid #0284c7' : '1px solid var(--border-color)',
                backgroundColor: accentColor === 'blue' ? 'var(--accent-primary-light)' : 'var(--bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              id="settings-theme-blue-btn"
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)',
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Light Sky Blue
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {accentColor === 'blue' ? '● Currently Active' : 'Default Palette'}
                </div>
              </div>
            </button>

            {/* Sunset Orange Option */}
            <button
              type="button"
              onClick={() => {
                setAccentColor('orange');
                showToast({ type: 'info', message: 'Theme accent changed to Sunset Orange.' });
              }}
              className="card"
              style={{
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: accentColor === 'orange' ? '2px solid #ea580c' : '1px solid var(--border-color)',
                backgroundColor: accentColor === 'orange' ? 'rgba(234, 88, 12, 0.1)' : 'var(--bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              id="settings-theme-orange-btn"
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#ea580c',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.4)',
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Sunset Orange
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {accentColor === 'orange' ? '● Currently Active' : 'Warm Tangerine'}
                </div>
              </div>
            </button>

            {/* Blossom Pink Option */}
            <button
              type="button"
              onClick={() => {
                setAccentColor('pink');
                showToast({ type: 'info', message: 'Theme accent changed to Blossom Pink.' });
              }}
              className="card"
              style={{
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: accentColor === 'pink' ? '2px solid #db2777' : '1px solid var(--border-color)',
                backgroundColor: accentColor === 'pink' ? 'rgba(219, 39, 119, 0.1)' : 'var(--bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              id="settings-theme-pink-btn"
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#db2777',
                  boxShadow: '0 2px 6px rgba(219, 39, 119, 0.4)',
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Blossom Pink
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {accentColor === 'pink' ? '● Currently Active' : 'Radiant Rose'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div
        className="card"
        style={{
          borderColor: 'var(--accent-danger)',
          background: 'var(--accent-danger-light)',
        }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)' }}>
            <ShieldAlert size={20} />
            <h3 className="card-title" style={{ color: 'var(--accent-danger)' }}>
              Danger Zone
            </h3>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
          Deleting your account will permanently remove your user profile, all recorded
          income and expense transactions, and monthly budgets from the database. This action
          is irreversible.
        </p>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="btn btn-danger"
          id="delete-account-btn"
        >
          <ShieldAlert size={16} />
          <span>Permanently Delete My Account</span>
        </button>
      </div>

      {/* Confirm Delete Account Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Account and Data"
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
