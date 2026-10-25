import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  PlusCircle,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit2,
  PieChart,
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { BudgetModal } from '../components/BudgetModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const BudgetsPage = () => {
  const { formatCurrency } = useTheme();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );

  const [budgetsData, setBudgetsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = 'Budgets — SpendWise Financial Planner';
  }, []);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/budgets', { month: selectedMonth });
      if (data.success) {
        setBudgetsData(data);
      }
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to load budgets.' });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, showToast]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleDeleteConfirm = async () => {
    if (!deletingBudget) return;
    setDeleteLoading(true);

    try {
      await api.delete(`/budgets/${deletingBudget._id || deletingBudget.id}`);
      showToast({
        type: 'success',
        message: `${deletingBudget.category} budget removed successfully.`,
      });
      setDeletingBudget(null);
      fetchBudgets();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Could not delete budget.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const overallBudget = budgetsData?.overallBudget;
  const categoryBudgets = budgetsData?.categoryBudgets || [];

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h2>Monthly Spending Budgets</h2>
          <p style={{ marginTop: '0.2rem' }}>
            Set financial spending guardrails and receive warnings before you overspend.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Month Picker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-surface)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Calendar size={18} color="var(--accent-primary)" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              aria-label="Select Budget Month"
            />
          </div>

          <button
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
            id="create-budget-btn"
          >
            <PlusCircle size={18} />
            <span>Set New Budget</span>
          </button>
        </div>
      </div>

      {/* Main Overall Monthly Budget Card */}
      <div className="card" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--accent-primary)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={22} color="var(--accent-primary)" />
            <h3 className="card-title">Overall Monthly Budget — {selectedMonth}</h3>
          </div>
          {overallBudget && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => {
                  setEditingBudget(overallBudget);
                  setIsModalOpen(true);
                }}
                className="icon-button"
                style={{ width: '32px', height: '32px' }}
                title="Edit overall budget"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => setDeletingBudget(overallBudget)}
                className="icon-button"
                style={{ width: '32px', height: '32px', color: 'var(--accent-danger)' }}
                title="Delete overall budget"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>

        {overallBudget ? (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.75rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Total Spent this Month
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {formatCurrency(overallBudget.spent)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Budget Limit
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCurrency(overallBudget.amount)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-track" style={{ height: '14px', marginBottom: '0.75rem' }}>
              <div
                className={`progress-bar ${overallBudget.status}`}
                style={{ width: `${Math.min(overallBudget.percentage, 100)}%` }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                {overallBudget.status === 'exceeded' && (
                  <span className="badge badge-expense">
                    <AlertTriangle size={14} /> Exceeded by{' '}
                    {formatCurrency(overallBudget.spent - overallBudget.amount)} (
                    {overallBudget.percentage}%)
                  </span>
                )}
                {overallBudget.status === 'warning' && (
                  <span className="badge badge-warning">
                    <AlertTriangle size={14} /> Warning: 80% limit reached (
                    {overallBudget.percentage}%)
                  </span>
                )}
                {overallBudget.status === 'normal' && (
                  <span className="badge badge-income">
                    <CheckCircle size={14} /> Healthy ({overallBudget.percentage}% used)
                  </span>
                )}
              </div>

              <div>
                <strong>Remaining: </strong>
                <span
                  style={{
                    color:
                      overallBudget.remaining > 0
                        ? 'var(--accent-income)'
                        : 'var(--accent-danger)',
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(overallBudget.remaining)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No overall budget defined for {selectedMonth}.</p>
            <button
              onClick={() => {
                setEditingBudget({ category: 'Overall', month: selectedMonth });
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.75rem' }}
            >
              Set Overall Budget
            </button>
          </div>
        )}
      </div>

      {/* Category-Specific Budgets Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={20} color="var(--accent-blue)" />
            <h3>Category-Specific Budgets</h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {categoryBudgets.length} Category Budgets Active
          </span>
        </div>

        {categoryBudgets.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <p>No category-specific budgets set for this month.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              You can cap specific spending areas like Food, Shopping, or Entertainment.
            </p>
            <button
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem' }}
            >
              Add Category Budget
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {categoryBudgets.map((b) => (
              <div key={b._id || b.id} className="card">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}
                >
                  <strong style={{ fontSize: '1.05rem' }}>{b.category}</strong>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => {
                        setEditingBudget(b);
                        setIsModalOpen(true);
                      }}
                      className="icon-button"
                      style={{ width: '28px', height: '28px' }}
                      title="Edit budget"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingBudget(b)}
                      className="icon-button"
                      style={{ width: '28px', height: '28px', color: 'var(--accent-danger)' }}
                      title="Delete budget"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span>Spent: {formatCurrency(b.spent)}</span>
                  <span>Cap: {formatCurrency(b.amount)}</span>
                </div>

                <div className="progress-track" style={{ marginBottom: '0.5rem' }}>
                  <div
                    className={`progress-bar ${b.status}`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    {b.status === 'exceeded' && (
                      <span className="badge badge-expense">Exceeded ({b.percentage}%)</span>
                    )}
                    {b.status === 'warning' && (
                      <span className="badge badge-warning">80% Warning ({b.percentage}%)</span>
                    )}
                    {b.status === 'normal' && (
                      <span className="badge badge-income">{b.percentage}% used</span>
                    )}
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Remaining: {formatCurrency(b.remaining)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchBudgets}
        initialMonth={selectedMonth}
        initialData={editingBudget}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingBudget}
        title="Delete Budget"
        message={`Are you sure you want to remove the ${deletingBudget?.category} budget for ${selectedMonth}?`}
        confirmText="Delete Budget"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingBudget(null)}
      />
    </div>
  );
};
