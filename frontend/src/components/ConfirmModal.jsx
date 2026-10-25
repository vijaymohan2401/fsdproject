import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  confirmBtnStyle = 'btn-danger',
  onConfirm,
  onClose,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)' }}>
            <AlertTriangle size={20} />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label="Close modal"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          {message}
        </p>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn ${confirmBtnStyle}`}
            id="confirm-action-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
