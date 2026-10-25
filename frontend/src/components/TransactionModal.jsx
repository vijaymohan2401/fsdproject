import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const INCOME_CATEGORIES = [
  'Pocket money or allowance',
  'Salary or stipend',
  'Freelance income',
  'Gifts',
  'Other income',
];

const EXPENSE_CATEGORIES = [
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

export const TransactionModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditing = !!(initialData && (initialData._id || initialData.id));
  const { showToast } = useToast();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill when editing or reset when adding
  useEffect(() => {
    if (initialData && (initialData._id || initialData.id)) {
      const txType = initialData.type || 'expense';
      setType(txType);
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setCategory(
        initialData.category ||
          (txType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
      );
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDescription(initialData.description || '');
    } else {
      const defaultType = initialData?.type || 'expense';
      setType(defaultType);
      setAmount('');
      setCategory(
        defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
      );
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  // Adjust default category when type toggles
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      if (!INCOME_CATEGORIES.includes(category)) {
        setCategory(INCOME_CATEGORIES[0]);
      }
    } else {
      if (!EXPENSE_CATEGORIES.includes(category)) {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount greater than zero.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type,
        amount: numericAmount,
        category,
        date,
        description: description.trim(),
      };

      if (isEditing) {
        await api.put(`/transactions/${initialData._id || initialData.id}`, payload);
        showToast({ type: 'success', message: 'Transaction updated successfully!' });
      } else {
        await api.post('/transactions', payload);
        showToast({ type: 'success', message: 'Transaction added successfully!' });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Transaction' : 'Record New Transaction'}</h3>
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
          {/* Type Selector Toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                style={
                  type === 'income'
                    ? { backgroundColor: 'var(--accent-income)', color: '#ffffff' }
                    : {}
                }
                onClick={() => handleTypeChange('income')}
              >
                <ArrowUpCircle size={18} />
                <span>Income</span>
              </button>
              <button
                type="button"
                className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => handleTypeChange('expense')}
              >
                <ArrowDownCircle size={18} />
                <span>Expense</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-amount">
              Amount *
            </label>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 1500.00"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-category">
              Category *
            </label>
            <select
              id="tx-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-date">
              Date *
            </label>
            <input
              id="tx-date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Optional Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-description">
              Description or Note (Optional)
            </label>
            <input
              id="tx-description"
              type="text"
              placeholder="e.g. Reference books, Canteen coffee"
              maxLength="250"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Modal Actions */}
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
              id="save-tx-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
