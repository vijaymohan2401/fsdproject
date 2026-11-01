import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  Activity,
  Layers,
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
    document.title = 'Analytics & Reports — SpendWise Financial Intelligence';
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
    showToast({ type: 'info', message: 'Downloading monthly analytical CSV report...' });
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

  // Real, Evidence-Based Derived Insights
  const derivedInsights = useMemo(() => {
    const insights = [];

    // 1. Savings Rate Assessment
    if (currentStats.income > 0) {
      const rate = Math.round(((currentStats.income - currentStats.expense) / currentStats.income) * 100);
      if (rate >= 30) {
        insights.push({
          title: 'Strong Capital Accumulation',
          desc: `You saved ${rate}% of your income in ${selectedMonth}, outperforming standard financial advisory benchmarks (20%).`,
        });
      } else if (rate > 0) {
        insights.push({
          title: 'Positive Cash Flow',
          desc: `You maintained a positive savings rate of ${rate}% (${formatCurrency(currentStats.net)} net surplus).`,
        });
      } else {
        insights.push({
          title: 'Deficit Warning',
          desc: `Monthly expenditures exceeded incoming revenue by ${formatCurrency(Math.abs(currentStats.net))}. Review variable categories.`,
        });
      }
    }

    // 2. Category Concentration
    if (highestCat && currentStats.expense > 0) {
      insights.push({
        title: `Primary Cost Driver: ${highestCat.category}`,
        desc: `${highestCat.category} represents ${highestCat.percentage}% of all expenditures this month (${formatCurrency(highestCat.amount)}).`,
      });
    }

    // 3. Month-over-Month Trend
    if (comparison.hasPriorData && comparison.prevExpense > 0 && comparison.expenseChangePct !== null) {
      if (comparison.expenseChangePct < 0) {
        insights.push({
          title: 'Expenditure Reduction',
          desc: `Total expenses declined by ${Math.abs(comparison.expenseChangePct)}% compared to ${comparison.prevMonth}.`,
        });
      } else if (comparison.expenseChangePct > 0) {
        insights.push({
          title: 'Outflow Expansion',
          desc: `Expenses increased by ${comparison.expenseChangePct}% relative to the previous billing cycle (${formatCurrency(comparison.prevExpense)}).`,
        });
      }
    }

    return insights;
  }, [currentStats, comparison, highestCat, selectedMonth, formatCurrency]);

  const hasHistoricalData = analytics?.monthlyTrends?.some((t) => (t.income || 0) > 0 || (t.expense || 0) > 0);

  return (
    <div className="analytics-workspace">
      {/* 1. Header and Controls */}
      <div className="tx-header-wrap">
        <div>
          <h2>Financial Intelligence & Trends</h2>
          <p>Longitudinal cash flow patterns, distribution ratios, and comparative telemetry.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="period-badge-picker">
            <Calendar size={15} color="var(--accent-primary)" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select Report Month"
            />
          </div>

          <button onClick={handleExportCSV} className="btn btn-secondary" id="report-csv-btn">
            <Download size={15} />
            <span>Export Month CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Visual: 6-Month Income vs Expense Historical Trajectory Chart */}
      <div className="analytics-hero-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>6-Month Trajectory: Cash Inflow vs Outflow</h3>
            <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
              Historical cash flow curves leading into {selectedMonth}
            </span>
          </div>
          {!hasHistoricalData && (
            <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
              Historical transactions will populate automatically
            </span>
          )}
        </div>

        <MonthlyTrendChart trends={analytics?.monthlyTrends || []} />
      </div>

      {/* 3. Month-over-Month Comparative Telemetry Table (Structured Matrix, NO duplicate card grid!) */}
      <div className="mom-telemetry-container">
        <table className="mom-table">
          <thead>
            <tr>
              <th>Financial Metric</th>
              <th style={{ textAlign: 'right' }}>Current Period ({selectedMonth})</th>
              <th style={{ textAlign: 'right' }}>Previous Period ({comparison.prevMonth})</th>
              <th style={{ textAlign: 'right', width: '180px' }}>MoM Trajectory Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} color="var(--accent-income)" />
                  <strong>Monthly Inflow (Income)</strong>
                </div>
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-income)' }}>
                +{formatCurrency(currentStats.income)}
              </td>
              <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                {comparison.hasPriorData && comparison.prevIncome > 0
                  ? formatCurrency(comparison.prevIncome)
                  : comparison.hasPriorData
                  ? formatCurrency(0)
                  : '—'}
              </td>
              <td style={{ textAlign: 'right' }}>
                {comparison.hasPriorData ? (
                  comparison.incomeChangePct !== null ? (
                    comparison.incomeChangePct >= 0 ? (
                      <span className="badge badge-income">
                        <ArrowUpRight size={13} /> +{comparison.incomeChangePct}%
                      </span>
                    ) : (
                      <span className="badge badge-expense">
                        <ArrowDownRight size={13} /> {comparison.incomeChangePct}%
                      </span>
                    )
                  ) : currentStats.income > 0 ? (
                    <span className="badge badge-income">
                      <ArrowUpRight size={13} /> New Inflow
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Change</span>
                  )
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No prior records</span>
                )}
              </td>
            </tr>

            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingDown size={16} color="var(--accent-expense)" />
                  <strong>Monthly Outflow (Expenses)</strong>
                </div>
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-expense)' }}>
                -{formatCurrency(currentStats.expense)}
              </td>
              <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                {comparison.hasPriorData && comparison.prevExpense > 0
                  ? formatCurrency(comparison.prevExpense)
                  : comparison.hasPriorData
                  ? formatCurrency(0)
                  : '—'}
              </td>
              <td style={{ textAlign: 'right' }}>
                {comparison.hasPriorData ? (
                  comparison.expenseChangePct !== null ? (
                    comparison.expenseChangePct > 0 ? (
                      <span className="badge badge-expense">
                        <ArrowUpRight size={13} /> +{comparison.expenseChangePct}% spend increase
                      </span>
                    ) : (
                      <span className="badge badge-income">
                        <ArrowDownRight size={13} /> {comparison.expenseChangePct}% spend reduction
                      </span>
                    )
                  ) : currentStats.expense > 0 ? (
                    <span className="badge badge-expense">
                      <ArrowUpRight size={13} /> New Outflow
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Change</span>
                  )
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No prior records</span>
                )}
              </td>
            </tr>

            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={16} color="var(--accent-primary)" />
                  <strong>Net Surplus / Savings</strong>
                </div>
              </td>
              <td
                style={{
                  textAlign: 'right',
                  fontWeight: 700,
                  color: currentStats.net >= 0 ? 'var(--accent-income)' : 'var(--accent-expense)',
                }}
              >
                {currentStats.net >= 0 ? '+' : ''}
                {formatCurrency(currentStats.net)}
              </td>
              <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                {comparison.hasPriorData ? formatCurrency(comparison.prevNet) : '—'}
              </td>
              <td style={{ textAlign: 'right' }}>
                <span className={`badge ${currentStats.net >= 0 ? 'badge-income' : 'badge-expense'}`}>
                  {currentStats.income > 0
                    ? `${Math.round(((currentStats.income - currentStats.expense) / currentStats.income) * 100)}% Savings Rate`
                    : '0% Savings Rate'}
                </span>
              </td>
            </tr>

            {highestCat && (
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={16} color="var(--accent-warning)" />
                    <strong>Primary Cost Driver</strong>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {highestCat.category} ({formatCurrency(highestCat.amount)})
                </td>
                <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                  {highestCat.percentage}% of all outflow
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge badge-neutral">Top Category</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Category Breakdown Analysis (Donut Chart + Ranked Distribution Matrix) */}
      <div className="analytics-breakdown-grid">
        {/* Left: Donut Visualization (Exclusive to Reports!) */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Expense Proportions</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedMonth}
            </span>
          </div>
          <CategoryDonutChart categories={categoryBreakdown} />
        </div>

        {/* Right: Ranked Distribution Matrix */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Category Ranking & Share Matrix</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {categoryBreakdown.length} Active Categories
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem' }}>No category expense records found for {selectedMonth}.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {categoryBreakdown.map((item, idx) => (
                <div key={item.category} className="ranked-cat-row">
                  <span className="cat-rank-pill">{idx + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{item.category}</strong>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    {/* Share Bar */}
                    <div className="progress-track" style={{ height: '5px' }}>
                      <div
                        className="progress-bar normal"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '38px', textAlign: 'right' }}>
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Telemetry Financial Insights Panel */}
      <div className="insights-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Real Financial Telemetry Insights</h3>
        </div>

        {derivedInsights.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            Record ongoing income and expenses across multiple months to generate comparative trend insights.
          </p>
        ) : (
          <div className="insights-list">
            {derivedInsights.map((insight, idx) => (
              <div key={idx} className="insight-bubble">
                <strong>{insight.title}</strong>
                <p>{insight.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
