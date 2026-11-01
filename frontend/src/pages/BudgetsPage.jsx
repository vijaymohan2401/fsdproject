import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Target,
  PlusCircle,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit2,
  PieChart,
  ShieldCheck,
  TrendingDown,
  Clock,
  Sliders,
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
    document.title = 'Budgets — SpendWise Spending Guardrails';
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
        message: `${deletingBudget.category} budget removed.`,
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

  // Calculate days remaining in selected month for burn rate insights
  const daysRemainingInMonth = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const y = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const now = new Date();

    if (now.getFullYear() > y || (now.getFullYear() === y && now.getMonth() + 1 > m)) {
      return 0; // Past month
    }
    if (now.getFullYear() === y && now.getMonth() + 1 === m) {
      const lastDay = new Date(y, m, 0).getDate();
      return Math.max(1, lastDay - now.getDate());
    }
    return new Date(y, m, 0).getDate(); // Future month
  }, [selectedMonth]);

  const dailyAllowance = useMemo(() => {
    if (!overallBudget || overallBudget.remaining <= 0 || daysRemainingInMonth <= 0) {
      return 0;
    }
    return Math.round((overallBudget.remaining / daysRemainingInMonth) * 100) / 100;
  }, [overallBudget, daysRemainingInMonth]);

  return (
    <div className="budgets-workspace">
      {/* 1. Header with Period & Action */}
      <div className="tx-header-wrap">
        <div>
          <h2>Spending Controls & Limits</h2>
          <p>Configure monthly spending ceilings and category guardrails to prevent overspending.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="period-badge-picker">
            <Calendar size={15} color="var(--accent-primary)" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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
            <PlusCircle size={15} />
            <span>Configure Budget</span>
          </button>
        </div>
      </div>

      {/* Smart Budget Alert Banners */}
      {overallBudget && overallBudget.status === 'exceeded' && (
        <div className="budget-alert-banner exceeded" role="alert">
          <AlertTriangle size={20} className="budget-alert-banner-icon" />
          <div className="budget-alert-banner-body">
            <div className="budget-alert-banner-title">Monthly Spending Ceiling Exceeded</div>
            <p className="budget-alert-banner-text">
              You have exceeded your monthly budget by{' '}
              <strong>{formatCurrency(overallBudget.overspent || Math.abs(overallBudget.remaining))}</strong>{' '}
              ({overallBudget.percentage}% utilized). Discretionary transactions are exceeding planned limits.
            </p>
          </div>
        </div>
      )}

      {overallBudget && overallBudget.status === 'limit_reached' && (
        <div className="budget-alert-banner limit_reached" role="alert">
          <Target size={20} className="budget-alert-banner-icon" />
          <div className="budget-alert-banner-body">
            <div className="budget-alert-banner-title">Monthly Spending Ceiling Limit Reached</div>
            <p className="budget-alert-banner-text">
              You have reached exactly 100% of your monthly budget limit ({formatCurrency(overallBudget.amount)}). 
              Any further expense transactions will result in an overdraft.
            </p>
          </div>
        </div>
      )}

      {overallBudget && overallBudget.status === 'warning' && (
        <div className="budget-alert-banner warning" role="alert">
          <AlertTriangle size={20} className="budget-alert-banner-icon" />
          <div className="budget-alert-banner-body">
            <div className="budget-alert-banner-title">Monthly Budget Running Low</div>
            <p className="budget-alert-banner-text">
              Your monthly budget is running low ({overallBudget.percentage}% utilized). Only{' '}
              <strong>{formatCurrency(overallBudget.remaining)}</strong> remains.
            </p>
          </div>
        </div>
      )}

      {/* Category Budget Alerts (if any category is exceeded or running low) */}
      {categoryBudgets.some((b) => b.status === 'exceeded') && (
        <div className="budget-alert-banner exceeded" role="alert">
          <AlertTriangle size={20} className="budget-alert-banner-icon" />
          <div className="budget-alert-banner-body">
            <div className="budget-alert-banner-title">Category Guardrails Exceeded</div>
            <p className="budget-alert-banner-text">
              One or more category budgets have exceeded their allocated limits:{' '}
              {categoryBudgets
                .filter((b) => b.status === 'exceeded')
                .map((b) => `${b.category} (exceeded by ${formatCurrency(b.overspent || Math.abs(b.remaining))})`)
                .join(', ')}
              .
            </p>
          </div>
        </div>
      )}

      {/* 2. Executive Overall Spending Ceiling Master Strip (NO 4-box card grid!) */}
      <div className="budget-master-strip">
        <div className="budget-master-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="dash-metric-icon" style={{ backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
              <Target size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                Monthly Spending Ceiling ({selectedMonth})
              </h3>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {overallBudget
                  ? `${overallBudget.percentage}% of overall monthly allowance utilized`
                  : 'No overarching monthly ceiling assigned'}
              </span>
            </div>
          </div>

          {overallBudget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {overallBudget.status === 'exceeded' && (
                <span className="badge badge-expense">
                  <AlertTriangle size={13} /> Over Limit ({overallBudget.percentage}%)
                </span>
              )}
              {overallBudget.status === 'limit_reached' && (
                <span className="badge badge-warning" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                  <Target size={13} /> Limit Reached (100%)
                </span>
              )}
              {overallBudget.status === 'warning' && (
                <span className="badge badge-warning">
                  <AlertTriangle size={13} /> 80% Cap Warning
                </span>
              )}
              {overallBudget.status === 'normal' && (
                <span className="badge badge-income">
                  <CheckCircle size={13} /> On Target ({overallBudget.percentage}%)
                </span>
              )}

              <button
                onClick={() => {
                  setEditingBudget(overallBudget);
                  setIsModalOpen(true);
                }}
                className="icon-button"
                style={{ width: '30px', height: '30px' }}
                title="Edit ceiling"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => setDeletingBudget(overallBudget)}
                className="icon-button"
                style={{ width: '30px', height: '30px', color: 'var(--accent-danger)' }}
                title="Remove ceiling"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {overallBudget ? (
          <div>
            {/* Inline Overview Metrics */}
            <div className="budget-master-overview">
              <div className="master-overview-numbers">
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Monthly Ceiling
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatCurrency(overallBudget.amount)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Current Outflow
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-expense)' }}>
                    {formatCurrency(overallBudget.spent)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {overallBudget.status === 'exceeded'
                      ? 'Exceeded By'
                      : 'Remaining Allowance'}
                  </span>
                  <div
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color:
                        overallBudget.status === 'exceeded'
                          ? 'var(--accent-expense)'
                          : overallBudget.status === 'limit_reached'
                          ? '#0284c7'
                          : 'var(--accent-income)',
                    }}
                  >
                    {overallBudget.status === 'exceeded'
                      ? `+${formatCurrency(overallBudget.overspent || Math.abs(overallBudget.remaining))}`
                      : formatCurrency(Math.max(0, overallBudget.remaining))}
                  </div>
                </div>
              </div>

              {daysRemainingInMonth > 0 && (
                <div style={{ textAlign: 'right', backgroundColor: 'var(--bg-surface-hover)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Safe Daily Burn Rate
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>
                    {formatCurrency(dailyAllowance)} / day
                  </strong>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>
                    ({daysRemainingInMonth} days remaining)
                  </span>
                </div>
              )}
            </div>

            {/* Visual Progress Bar */}
            <div className="progress-track" style={{ height: '10px' }}>
              <div
                className={`progress-bar ${overallBudget.status}`}
                style={{ width: `${Math.min(overallBudget.percentage, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              You haven't established an overall spending ceiling for {selectedMonth}.
            </p>
            <button
              onClick={() => {
                setEditingBudget({ category: 'Overall', month: selectedMonth });
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.85rem' }}
            >
              Set Monthly Ceiling
            </button>
          </div>
        )}
      </div>

      {/* 3. Category Guardrails Section: Structured Management Table (NOT duplicate cards!) */}
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
            <Sliders size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Category Allocation & Guardrails</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {categoryBudgets.length} Category Caps Configured
          </span>
        </div>

        {categoryBudgets.length === 0 ? (
          <div className="budget-empty-box">
            <ShieldCheck size={32} color="var(--accent-primary)" style={{ margin: '0 auto 0.75rem' }} />
            <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              No Category Guardrails Active
            </strong>
            <p style={{ fontSize: '0.825rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
              Set individual caps for variable expenses such as Food, Entertainment, or Shopping to prevent surprises.
            </p>
            <button
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem' }}
            >
              <PlusCircle size={14} />
              <span>Create Category Cap</span>
            </button>
          </div>
        ) : (
          <div className="budget-table-container">
            <table className="budget-table">
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Category</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Spent</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Cap Limit</th>
                  <th style={{ textAlign: 'right', width: '140px' }}>Remaining</th>
                  <th>Usage & Progress</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Health</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryBudgets.map((b) => (
                  <tr key={b._id || b.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {b.category}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatCurrency(b.spent)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {formatCurrency(b.amount)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color:
                          b.status === 'exceeded'
                            ? 'var(--accent-expense)'
                            : b.status === 'limit_reached'
                            ? '#0284c7'
                            : 'var(--accent-income)',
                      }}
                    >
                      {b.status === 'exceeded'
                        ? `-${formatCurrency(b.overspent || Math.abs(b.remaining))}`
                        : b.status === 'limit_reached'
                        ? formatCurrency(0)
                        : formatCurrency(b.remaining)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="progress-track" style={{ height: '7px', flex: 1 }}>
                          <div
                            className={`progress-bar ${b.status}`}
                            style={{ width: `${Math.min(b.percentage, 100)}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '38px', textAlign: 'right' }}>
                          {b.percentage}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {b.status === 'exceeded' && (
                        <span className="badge badge-expense" style={{ fontSize: '0.7rem' }}>
                          Over Limit
                        </span>
                      )}
                      {b.status === 'limit_reached' && (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                          Limit Reached
                        </span>
                      )}
                      {b.status === 'warning' && (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                          80% Warning
                        </span>
                      )}
                      {b.status === 'normal' && (
                        <span className="badge badge-income" style={{ fontSize: '0.7rem' }}>
                          On Track
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                        <button
                          onClick={() => {
                            setEditingBudget(b);
                            setIsModalOpen(true);
                          }}
                          className="icon-button"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit cap"
                          aria-label={`Edit ${b.category} cap`}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setDeletingBudget(b)}
                          className="icon-button"
                          style={{ width: '28px', height: '28px', color: 'var(--accent-danger)' }}
                          title="Delete cap"
                          aria-label={`Delete ${b.category} cap`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        confirmText="Confirm Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingBudget(null)}
      />
    </div>
  );
};
