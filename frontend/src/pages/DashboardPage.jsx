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
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IncomeExpenseBarChart } from '../components/Charts/IncomeExpenseBarChart';
import { CategoryDonutChart } from '../components/Charts/CategoryDonutChart';
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
    document.title = 'Dashboard — SpendWise Financial Tracker';
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

  const summary = dashboardData?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    budgetLimit: 0,
    budgetRemaining: 0,
    budgetPercentage: 0,
    budgetStatus: 'none',
  };

  const openAddTransaction = (initialType = 'expense') => {
    setTxModalInitialType(initialType);
    setIsTxModalOpen(true);
  };

  return (
    <div>
      {/* Top Welcome Bar & Month Selector */}
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
          <h2>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
          <p style={{ marginTop: '0.2rem' }}>
            Here is your financial overview for the selected month.
          </p>
        </div>

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
          <label htmlFor="dashboard-month-picker" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Period:
          </label>
          <input
            id="dashboard-month-picker"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          />
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
          }}
        >
          {error}
        </div>
      )}

      {/* 4 Financial Metric Cards */}
      <div className="metrics-grid">
        {/* Income Card */}
        <div className="metric-card income">
          <div className="metric-header">
            <span className="metric-label">Total Income</span>
            <div className="metric-icon-wrap">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(summary.totalIncome)}</div>
          <div className="metric-subtext">Sum of income for {selectedMonth}</div>
        </div>

        {/* Expenses Card */}
        <div className="metric-card expense">
          <div className="metric-header">
            <span className="metric-label">Total Expenses</span>
            <div className="metric-icon-wrap">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(summary.totalExpenses)}</div>
          <div className="metric-subtext">Sum of expenses for {selectedMonth}</div>
        </div>

        {/* Available Balance Card */}
        <div className="metric-card balance">
          <div className="metric-header">
            <span className="metric-label">Net Balance</span>
            <div className="metric-icon-wrap">
              <Wallet size={18} />
            </div>
          </div>
          <div
            className="metric-value"
            style={{
              color: summary.netBalance >= 0 ? 'var(--accent-income)' : 'var(--accent-danger)',
            }}
          >
            {formatCurrency(summary.netBalance)}
          </div>
          <div className="metric-subtext">Income minus expenses for period</div>
        </div>

        {/* Budget Remaining Card */}
        <div className="metric-card budget">
          <div className="metric-header">
            <span className="metric-label">Budget Remaining</span>
            <div className="metric-icon-wrap">
              <Target size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(summary.budgetRemaining)}</div>
          <div className="metric-subtext">
            {summary.budgetLimit > 0
              ? `${summary.budgetPercentage}% of ${formatCurrency(summary.budgetLimit)} used`
              : 'No overall budget set'}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        <button
          onClick={() => openAddTransaction('income')}
          className="btn btn-primary"
          id="quick-add-income-btn"
          style={{ backgroundColor: 'var(--accent-income)' }}
        >
          <PlusCircle size={18} />
          <span>Record Income</span>
        </button>
        <button
          onClick={() => openAddTransaction('expense')}
          className="btn btn-danger"
          id="quick-add-expense-btn"
        >
          <PlusCircle size={18} />
          <span>Record Expense</span>
        </button>
        <button
          onClick={() => setIsBudgetModalOpen(true)}
          className="btn btn-secondary"
          id="quick-set-budget-btn"
        >
          <Target size={18} />
          <span>Set Monthly Budget</span>
        </button>
      </div>

      {/* Budget Health Alert & Progress Bar */}
      {summary.budgetLimit > 0 && (
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} color="var(--accent-primary)" />
              <strong>Monthly Overall Budget Progress</strong>
            </div>
            <div>
              {summary.budgetStatus === 'exceeded' && (
                <span className="badge badge-expense">
                  <AlertTriangle size={14} /> Exceeded (100%+)
                </span>
              )}
              {summary.budgetStatus === 'warning' && (
                <span className="badge badge-warning">
                  <AlertTriangle size={14} /> Warning (80% Reached)
                </span>
              )}
              {summary.budgetStatus === 'normal' && (
                <span className="badge badge-income">
                  <CheckCircle size={14} /> On Track
                </span>
              )}
            </div>
          </div>

          <div className="progress-track" style={{ height: '12px', marginBottom: '0.75rem' }}>
            <div
              className={`progress-bar ${summary.budgetStatus}`}
              style={{ width: `${Math.min(summary.budgetPercentage, 100)}%` }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
            }}
          >
            <span>Spent: {formatCurrency(summary.totalExpenses)}</span>
            <span>Limit: {formatCurrency(summary.budgetLimit)}</span>
            <span>Remaining: {formatCurrency(summary.budgetRemaining)}</span>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Income vs Expenses Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Income vs Expenses</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {selectedMonth}
            </span>
          </div>
          <IncomeExpenseBarChart
            income={summary.totalIncome}
            expenses={summary.totalExpenses}
          />
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Spending</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Expense Distribution
            </span>
          </div>
          <CategoryDonutChart categories={dashboardData?.categoryBreakdown || []} />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
          <Link
            to="/transactions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
            id="view-all-tx-link"
          >
            <span>View All</span>
            <ArrowRight size={16} />
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
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentTransactions?.map((tx) => (
                  <tr key={tx._id || tx.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          tx.type === 'income' ? 'badge-income' : 'badge-expense'
                        }`}
                      >
                        {tx.type === 'income' ? '+ Income' : '- Expense'}
                      </span>
                    </td>
                    <td>{tx.category}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {tx.description || '—'}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color:
                          tx.type === 'income'
                            ? 'var(--accent-income)'
                            : 'var(--accent-expense)',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={fetchDashboard}
        initialData={{ type: txModalInitialType }}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSuccess={fetchDashboard}
        initialMonth={selectedMonth}
      />
    </div>
  );
};
