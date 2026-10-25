import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { MonthlyTrendChart } from '../components/Charts/MonthlyTrendChart';
import { CategoryDonutChart } from '../components/Charts/CategoryDonutChart';

export const ReportsPage = () => {
  const { formatCurrency } = useTheme();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Reports & Financial Insights — SpendWise';
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/reports/analytics', { month: selectedMonth });
      if (data.success) {
        setAnalytics(data);
      }
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to load report analytics.' });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCSV = () => {
    const exportUrl = `/api/transactions/export/csv?month=${selectedMonth}`;
    window.open(exportUrl, '_blank');
    showToast({ type: 'info', message: 'Downloading monthly sanitized CSV report...' });
  };

  const currentStats = analytics?.currentStats || { income: 0, expense: 0, net: 0 };
  const comparison = analytics?.comparison || {
    incomeChangePct: 0,
    expenseChangePct: 0,
    prevIncome: 0,
    prevExpense: 0,
    prevNet: 0,
  };
  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const highestCat = analytics?.highestExpenseCategory;

  return (
    <div>
      {/* Header and Controls */}
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
          <h2>Financial Reports & Analytics</h2>
          <p style={{ marginTop: '0.2rem' }}>
            Comprehensive analysis of your cash flow, habits, and month-over-month trends.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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
              aria-label="Select Report Month"
            />
          </div>

          <button onClick={handleExportCSV} className="btn btn-secondary" id="report-csv-btn">
            <Download size={18} />
            <span>Export Month CSV</span>
          </button>
        </div>
      </div>

      {/* MoM Comparison Cards Grid */}
      <div className="metrics-grid">
        {/* Income & % change */}
        <div className="metric-card income">
          <div className="metric-header">
            <span className="metric-label">Monthly Income</span>
            <div className="metric-icon-wrap">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(currentStats.income)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            {comparison.incomeChangePct > 0 ? (
              <span style={{ color: 'var(--accent-income)', display: 'inline-flex', alignItems: 'center' }}>
                <ArrowUpRight size={16} /> +{comparison.incomeChangePct}%
              </span>
            ) : comparison.incomeChangePct < 0 ? (
              <span style={{ color: 'var(--accent-danger)', display: 'inline-flex', alignItems: 'center' }}>
                <ArrowDownRight size={16} /> {comparison.incomeChangePct}%
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>0% change</span>
            )}
            <span style={{ color: 'var(--text-muted)' }}>vs previous month</span>
          </div>
        </div>

        {/* Expenses & % change */}
        <div className="metric-card expense">
          <div className="metric-header">
            <span className="metric-label">Monthly Expenses</span>
            <div className="metric-icon-wrap">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(currentStats.expense)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            {comparison.expenseChangePct > 0 ? (
              <span style={{ color: 'var(--accent-danger)', display: 'inline-flex', alignItems: 'center' }}>
                <ArrowUpRight size={16} /> +{comparison.expenseChangePct}%
              </span>
            ) : comparison.expenseChangePct < 0 ? (
              <span style={{ color: 'var(--accent-income)', display: 'inline-flex', alignItems: 'center' }}>
                <ArrowDownRight size={16} /> {comparison.expenseChangePct}%
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>0% change</span>
            )}
            <span style={{ color: 'var(--text-muted)' }}>vs previous month</span>
          </div>
        </div>

        {/* Net Savings / Surplus */}
        <div className="metric-card balance">
          <div className="metric-header">
            <span className="metric-label">Net Surplus / Savings</span>
            <div className="metric-icon-wrap">
              <DollarSign size={18} />
            </div>
          </div>
          <div
            className="metric-value"
            style={{
              color: currentStats.net >= 0 ? 'var(--accent-income)' : 'var(--accent-danger)',
            }}
          >
            {formatCurrency(currentStats.net)}
          </div>
          <div className="metric-subtext">
            {currentStats.income > 0
              ? `Savings Rate: ${Math.round((Math.max(0, currentStats.net) / currentStats.income) * 100)}%`
              : 'Record income to calculate savings rate'}
          </div>
        </div>

        {/* Highest Category Spotlight */}
        <div className="metric-card budget">
          <div className="metric-header">
            <span className="metric-label">Highest Expense</span>
            <div className="metric-icon-wrap">
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.4rem' }}>
            {highestCat ? highestCat.category : 'None'}
          </div>
          <div className="metric-subtext">
            {highestCat
              ? `${formatCurrency(highestCat.amount)} (${highestCat.percentage}% of expenses)`
              : 'No expenses recorded'}
          </div>
        </div>
      </div>

      {/* 6-Month Trajectory Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">6-Month Income vs Expense Trend</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Historical cash flow trajectory leading up to {selectedMonth}
            </p>
          </div>
        </div>
        <MonthlyTrendChart trends={analytics?.monthlyTrends || []} />
      </div>

      {/* Category Breakdown Table & Donut */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Category Donut Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Proportions</h3>
          </div>
          <CategoryDonutChart categories={categoryBreakdown} />
        </div>

        {/* Category Breakdown Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Breakdown Table</h3>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
              No category expense records found for {selectedMonth}.
            </p>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Share (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((item) => (
                    <tr key={item.category}>
                      <td>
                        <strong>{item.category}</strong>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(item.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-neutral">{item.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
