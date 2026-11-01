import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  PlusCircle,
  ArrowRight,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IncomeExpenseBarChart } from '../components/Charts/IncomeExpenseBarChart';
import { TransactionModal } from '../components/TransactionModal';
import { BudgetModal } from '../components/BudgetModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { formatCurrency } = useTheme();

  // Current month format: YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalInitialType, setTxModalInitialType] = useState('expense');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard — SpendWise Financial Overview';
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/reports/dashboard', { month: selectedMonth });
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      setError(err.message || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Listen for global custom events from the sidebar
  useEffect(() => {
    const handleGlobalUpdate = () => {
      fetchDashboard();
    };
    window.addEventListener('spendwise:data-updated', handleGlobalUpdate);
    return () => window.removeEventListener('spendwise:data-updated', handleGlobalUpdate);
  }, [fetchDashboard]);

  const summary = dashboardData?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    budgetLimit: 0,
    budgetRemaining: 0,
    budgetPercentage: 0,
    budgetStatus: 'none',
  };

  const categoryBreakdown = dashboardData?.categoryBreakdown || [];

  const openAddTransaction = (initialType = 'expense') => {
    setTxModalInitialType(initialType);
    setIsTxModalOpen(true);
  };

  const getCategoryInitial = (cat) => {
    if (!cat) return '•';
    return cat.slice(0, 1).toUpperCase();
  };

  return (
    <div>
      {/* 1. Header with Period Picker & Direct Actions */}
      <div className="dash-header-wrap">
        <div className="dash-header-meta">
          <h2>Welcome back, {user?.name?.split(' ')[0] || 'Member'}</h2>
          <p>Real-time cash flow position and executive spending overview for {selectedMonth}.</p>
        </div>

        <div className="dash-header-controls">
          {/* Period Selector */}
          <div className="period-badge-picker">
            <Calendar size={15} color="var(--accent-primary)" />
            <label htmlFor="dashboard-month-picker" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Period:
            </label>
            <input
              id="dashboard-month-picker"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select reporting month"
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="dash-action-group">
            <button
              onClick={() => openAddTransaction('expense')}
              className="btn btn-primary"
              id="quick-add-expense-btn"
              title="Record an outflow"
            >
              <PlusCircle size={15} />
              <span>Record Expense</span>
            </button>
            <button
              onClick={() => openAddTransaction('income')}
              className="btn btn-secondary"
              id="quick-add-income-btn"
              title="Record an inflow"
            >
              <TrendingUp size={15} color="var(--accent-income)" />
              <span>Record Income</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--accent-danger-light)',
            color: 'var(--accent-danger)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Dynamic Smart Budget Alert Banner for Monthly Spending Ceiling */}
      {summary.budgetLimit > 0 && summary.budgetStatus === 'exceeded' && (
        <div className="budget-alert-banner exceeded" role="alert">
          <AlertTriangle size={20} className="budget-alert-banner-icon" />
          <div className="budget-alert-banner-body">
            <div className="budget-alert-banner-title">Monthly Budget Exceeded</div>
            <p className="budget-alert-banner-text">
              You have exceeded your monthly budget by{' '}
              <strong>{formatCurrency(summary.budgetOverspent || (summary.totalExpenses - summary.budgetLimit))}</strong>{' '}
              ({summary.budgetPercentage}% used). Consider reviewing discretionary outlays.
            </p>
          </div>
        </div>
      )}

      {summary.budgetLimit > 0 && summary.budgetStatus === 'limit_reached' && (
        <div className="budget-alert-banner limit_reached" role="alert">
          <Target size={20} className="budget-alert-banner-icon" />
          <div className="budget-alert-banner-body">
            <div className="budget-alert-banner-title">Monthly Budget Limit Reached</div>
            <p className="budget-alert-banner-text">
              You have reached exactly 100% of your monthly budget limit ({formatCurrency(summary.budgetLimit)}). 
              Any further expense transactions will push your cash flow into a deficit.
            </p>
          </div>
        </div>
      )}

      {summary.budgetLimit > 0 && summary.budgetStatus === 'warning' && (
        <div className="budget-alert-banner warning" role="alert">
          <AlertTriangle size={20} className="budget-alert-banner-icon" />
          <div className="budget-alert-banner-body">
            <div className="budget-alert-banner-title">Monthly Budget Running Low</div>
            <p className="budget-alert-banner-text">
              Your monthly budget is running low ({summary.budgetPercentage}% utilized). Only{' '}
              <strong>{formatCurrency(summary.budgetRemaining)}</strong> remains before you reach your spending ceiling.
            </p>
          </div>
        </div>
      )}

      {/* 2. Asymmetric Executive Cash Flow Hero (NO 4-box card grid!) */}
      <div className="dash-executive-hero">
        {/* Left: Net Balance Hero Card */}
        <div className="dash-net-hero">
          <div>
            <div className="dash-net-hero-top">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Net Available Balance
              </span>
              {summary.netBalance >= 0 ? (
                <span className="badge badge-income">
                  <ArrowUpRight size={13} /> Surplus
                </span>
              ) : (
                <span className="badge badge-expense">
                  <ArrowDownRight size={13} /> Deficit
                </span>
              )}
            </div>
            <div className="dash-net-hero-val">{formatCurrency(summary.netBalance)}</div>
          </div>

          {/* Integrated Inflow & Outflow telemetry bar */}
          <div className="dash-net-hero-flow">
            <div>
              <span className="flow-col-label">Total Inflow</span>
              <span className="flow-col-val" style={{ color: 'var(--accent-income)' }}>
                +{formatCurrency(summary.totalIncome)}
              </span>
            </div>
            <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-color)' }} />
            <div>
              <span className="flow-col-label">Total Outflow</span>
              <span className="flow-col-val" style={{ color: 'var(--accent-expense)' }}>
                -{formatCurrency(summary.totalExpenses)}
              </span>
            </div>
            <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-color)' }} />
            <div>
              <span className="flow-col-label">Savings Velocity</span>
              <span className="flow-col-val" style={{ color: 'var(--text-primary)' }}>
                {summary.totalIncome > 0
                  ? `${Math.max(0, Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100))}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Spending Guardrail Status Dial */}
        <div className="dash-budget-dial-card">
          <div>
            <div className="dash-budget-dial-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Monthly Budget Guardrail
                </span>
              </div>
              {summary.budgetLimit > 0 && (
                <div>
                  {summary.budgetStatus === 'exceeded' && (
                    <span className="badge badge-expense">Exceeded ({summary.budgetPercentage}%)</span>
                  )}
                  {summary.budgetStatus === 'limit_reached' && (
                    <span className="badge badge-warning" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                      Limit Reached (100%)
                    </span>
                  )}
                  {summary.budgetStatus === 'warning' && (
                    <span className="badge badge-warning">Running Low ({summary.budgetPercentage}%)</span>
                  )}
                  {summary.budgetStatus === 'normal' && (
                    <span className="badge badge-income">On Track ({summary.budgetPercentage}%)</span>
                  )}
                </div>
              )}
            </div>

            {summary.budgetLimit > 0 ? (
              <>
                <div className="dash-budget-dial-stats">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Spent of Limit
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(summary.totalExpenses)}{' '}
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        / {formatCurrency(summary.budgetLimit)}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {summary.budgetStatus === 'exceeded' ? (
                      <>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-expense)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Exceeded By
                        </span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-expense)' }}>
                          +{formatCurrency(summary.budgetOverspent || (summary.totalExpenses - summary.budgetLimit))}
                        </div>
                      </>
                    ) : summary.budgetStatus === 'limit_reached' ? (
                      <>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Remaining
                        </span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                          {formatCurrency(0)}
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Remaining
                        </span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-income)' }}>
                          {formatCurrency(summary.budgetRemaining)}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="progress-track" style={{ height: '8px', marginBottom: '0.5rem' }}>
                  <div
                    className={`progress-bar ${summary.budgetStatus}`}
                    style={{ width: `${Math.min(summary.budgetPercentage, 100)}%` }}
                  />
                </div>
                <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                  {summary.budgetPercentage}% of overall spending allowance utilized
                </span>
              </>
            ) : (
              <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  No overall spending ceiling set for this month.
                </p>
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.75rem' }}
                >
                  Configure Budget Ceiling
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Link
              to="/budgets"
              style={{
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>Manage Budget Limits</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Cash Flow Bar on Left + Top Expense Categories on Right (No Donut Chart on Dashboard!) */}
      <div className="dash-middle-grid">
        {/* Left: Cash Flow Column Chart */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Cash Flow Dynamic</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Inflow vs Outflow
            </span>
          </div>
          <IncomeExpenseBarChart
            income={summary.totalIncome}
            expenses={summary.totalExpenses}
          />
        </div>

        {/* Right: Top Expense Drivers by Share (Horizontal progress bars, distinct from Reports Donut!) */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Top Expense Drivers</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              By Expense Share
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem' }}>No expenses recorded for {selectedMonth}.</p>
              <button
                onClick={() => openAddTransaction('expense')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                Log an Expense
              </button>
            </div>
          ) : (
            <div className="category-progress-list">
              {categoryBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.category} className="category-progress-item">
                  <div className="category-progress-meta">
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {cat.category}
                    </strong>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {formatCurrency(cat.amount)}{' '}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.775rem' }}>
                        ({cat.percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: '6px' }}>
                    <div
                      className="progress-bar normal"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {categoryBreakdown.length === 1 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  1 active category driver
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Section: Recent Activity Stream */}
      <div className="dash-panel">
        <div className="dash-panel-header">
          <h3 className="dash-panel-title">Recent Activity</h3>
          <Link
            to="/transactions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
            }}
            id="view-all-tx-link"
          >
            <span>Complete Ledger</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {dashboardData?.recentTransactions?.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <p>No transactions recorded yet.</p>
            <button
              onClick={() => openAddTransaction('expense')}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.75rem' }}
            >
              Log First Transaction
            </button>
          </div>
        ) : (
          <div className="activity-feed-list">
            {dashboardData?.recentTransactions?.map((tx) => (
              <div key={tx._id || tx.id} className="activity-row">
                <div className="activity-left">
                  <div
                    className="activity-cat-icon"
                    style={{
                      backgroundColor:
                        tx.type === 'income'
                          ? 'var(--accent-income-bg)'
                          : 'var(--accent-expense-bg)',
                      color:
                        tx.type === 'income'
                          ? 'var(--accent-income)'
                          : 'var(--accent-expense)',
                    }}
                  >
                    {getCategoryInitial(tx.category)}
                  </div>
                  <div className="activity-details">
                    <span className="activity-cat-name">{tx.category}</span>
                    <span className="activity-meta">
                      <span>
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {tx.description && <span>• {tx.description}</span>}
                    </span>
                  </div>
                </div>

                <div
                  className={`activity-amount ${tx.type === 'income' ? 'income' : 'expense'}`}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={fetchDashboard}
        initialData={{ type: txModalInitialType }}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSuccess={fetchDashboard}
        initialMonth={selectedMonth}
      />
    </div>
  );
};
