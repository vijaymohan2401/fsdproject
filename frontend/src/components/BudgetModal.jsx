import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const BUDGET_CATEGORIES = [
  'Overall',
  'Food',
  'Transportation',
  'Education',
  'Shopping',
  'Bills and utilities',
  'Entertainment',
  'Healthcare',
  'Subscriptions',
  'Other expenses',
];

export const BudgetModal = ({ isOpen, onClose, onSuccess, initialMonth, initialData = null }) => {
  const { showToast } = useToast();
  const [month, setMonth] = useState(
    initialMonth || new Date().toISOString().slice(0, 7)
  );
  const [category, setCategory] = useState('Overall');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setMonth(initialData.month || initialMonth || new Date().toISOString().slice(0, 7));
      setCategory(initialData.category || 'Overall');
      setAmount(initialData.amount ? String(initialData.amount) : '');
    } else {
      setMonth(initialMonth || new Date().toISOString().slice(0, 7));
      setCategory('Overall');
      setAmount('');
    }
    setError('');
  }, [initialData, initialMonth, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive budget limit greater than zero.');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/budgets', {
        month,
        category,
        amount: numericAmount,
      });

      showToast({
        type: 'success',
        message: `${category} budget for ${month} saved successfully!`,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save budget limit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="var(--accent-primary)" />
            <span>Set Monthly Budget</span>
          </h3>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label="Close modal"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--accent-danger-light)',
              color: 'var(--accent-danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Month */}
          <div className="form-group">
            <label className="form-label" htmlFor="budget-month">
              Budget Month *
            </label>
            <input
              id="budget-month"
              type="month"
              className="form-input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="budget-category">
              Budget Scope *
            </label>
            <select
              id="budget-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {BUDGET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Overall' ? '★ Overall Monthly Budget' : `${cat} Only`}
                </option>
              ))}
            </select>
            <span className="form-help">
              Tip: You can set an overall budget and separate category budgets. Category
              budgets are tracked individually without double-counting.
            </span>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="budget-amount">
              Budget Spending Limit *
            </label>
            <input
              id="budget-amount"
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 10000"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-budget-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Set Budget Limit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
