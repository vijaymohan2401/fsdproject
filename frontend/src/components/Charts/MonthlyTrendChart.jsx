import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const MonthlyTrendChart = ({ trends = [] }) => {
  const { formatCurrency } = useTheme();

  if (!trends || trends.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No historical trend data available.</p>;
  }

  const maxVal = Math.max(
    ...trends.map((t) => Math.max(t.income, t.expense)),
    1000
  );

  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const pointsCount = trends.length;
  const stepX = chartW / Math.max(pointsCount - 1, 1);

  // Calculate coordinates for income and expense lines
  const incomePoints = trends.map((t, i) => {
    const x = paddingX + i * stepX;
    const y = height - paddingY - (t.income / maxVal) * chartH;
    return { x, y, val: t.income, label: t.label };
  });

  const expensePoints = trends.map((t, i) => {
    const x = paddingX + i * stepX;
    const y = height - paddingY - (t.expense / maxVal) * chartH;
    return { x, y, val: t.expense, label: t.label };
  });

  const createPath = (points) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ minWidth: '480px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - paddingY - pct * chartH;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {Math.round(maxVal * pct)}
                </text>
              </g>
            );
          })}

          {/* Income Trend Line */}
          <path
            d={createPath(incomePoints)}
            fill="none"
            stroke="var(--accent-income)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Expense Trend Line */}
          <path
            d={createPath(expensePoints)}
            fill="none"
            stroke="var(--accent-expense)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Dots and Labels */}
          {incomePoints.map((p, idx) => (
            <g key={`income-${idx}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="var(--bg-surface)"
                stroke="var(--accent-income)"
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={height - 8}
                fill="var(--text-secondary)"
                fontSize="11"
                textAnchor="middle"
              >
                {p.label}
              </text>
            </g>
          ))}

          {expensePoints.map((p, idx) => (
            <circle
              key={`expense-${idx}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--bg-surface)"
              stroke="var(--accent-expense)"
              strokeWidth="2.5"
            />
          ))}
        </svg>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '0.75rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: '12px',
                height: '3px',
                backgroundColor: 'var(--accent-income)',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Income</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: '12px',
                height: '3px',
                backgroundColor: 'var(--accent-expense)',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
};
