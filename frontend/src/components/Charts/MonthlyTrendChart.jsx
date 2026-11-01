import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const MonthlyTrendChart = ({ trends = [] }) => {
  const { formatCurrency } = useTheme();
  const [activePoint, setActivePoint] = useState(null);

  if (!trends || trends.length === 0) {
    return (
      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No historical trend records found.</p>
        <span style={{ fontSize: '0.8rem' }}>
          Data accumulates as you log transactions across consecutive months.
        </span>
      </div>
    );
  }

  const maxVal = Math.max(
    ...trends.map((t) => Math.max(t.income || 0, t.expense || 0)),
    1000
  );

  const width = 640;
  const height = 230;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const pointsCount = trends.length;
  const stepX = chartW / Math.max(pointsCount - 1, 1);

  // Coordinates
  const incomePoints = trends.map((t, i) => {
    const x = paddingLeft + i * stepX;
    const y = height - paddingBottom - ((t.income || 0) / maxVal) * chartH;
    return { x, y, val: t.income || 0, label: t.label, raw: t };
  });

  const expensePoints = trends.map((t, i) => {
    const x = paddingLeft + i * stepX;
    const y = height - paddingBottom - ((t.expense || 0) / maxVal) * chartH;
    return { x, y, val: t.expense || 0, label: t.label, raw: t };
  });

  const createPath = (points) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const createAreaPath = (points) => {
    const line = createPath(points);
    const lastX = points[points.length - 1].x.toFixed(1);
    const firstX = points[0].x.toFixed(1);
    const bottomY = (height - paddingBottom).toFixed(1);
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
      <div style={{ minWidth: '520px', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-income)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent-income)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-expense)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent-expense)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = height - paddingBottom - pct * chartH;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-sans)"
                >
                  {formatCurrency(Math.round(maxVal * pct)).replace(/\.00$/, '')}
                </text>
              </g>
            );
          })}

          {/* Area Gradients */}
          <path d={createAreaPath(incomePoints)} fill="url(#incomeAreaGrad)" />
          <path d={createAreaPath(expensePoints)} fill="url(#expenseAreaGrad)" />

          {/* Trend Lines */}
          <path
            d={createPath(incomePoints)}
            fill="none"
            stroke="var(--accent-income)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={createPath(expensePoints)}
            fill="none"
            stroke="var(--accent-expense)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {trends.map((t, idx) => {
            const x = paddingLeft + idx * stepX;
            return (
              <text
                key={`label-${idx}`}
                x={x}
                y={height - 10}
                fill="var(--text-secondary)"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                fontFamily="var(--font-sans)"
              >
                {t.label}
              </text>
            );
          })}

          {/* Interactive Hover Guides & Dots */}
          {trends.map((_, idx) => {
            const inc = incomePoints[idx];
            const exp = expensePoints[idx];
            const isActive = activePoint === idx;

            return (
              <g
                key={`points-${idx}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActivePoint(idx)}
                onMouseLeave={() => setActivePoint(null)}
              >
                {/* Invisible hover hitbox */}
                <rect
                  x={inc.x - stepX / 2}
                  y={paddingTop}
                  width={stepX}
                  height={chartH}
                  fill="transparent"
                />

                {isActive && (
                  <line
                    x1={inc.x}
                    y1={paddingTop}
                    x2={inc.x}
                    y2={height - paddingBottom}
                    stroke="var(--text-muted)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Income point */}
                <circle
                  cx={inc.x}
                  cy={inc.y}
                  r={isActive ? 6 : 4}
                  fill="var(--bg-surface)"
                  stroke="var(--accent-income)"
                  strokeWidth={isActive ? 3 : 2}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* Expense point */}
                <circle
                  cx={exp.x}
                  cy={exp.y}
                  r={isActive ? 6 : 4}
                  fill="var(--bg-surface)"
                  stroke="var(--accent-expense)"
                  strokeWidth={isActive ? 3 : 2}
                  style={{ transition: 'all 0.15s ease' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip when hovering over a month */}
        {activePoint !== null && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.8rem',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              {trends[activePoint]?.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-income)' }}>
              <span>Income:</span>
              <strong>{formatCurrency(trends[activePoint]?.income || 0)}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-expense)' }}>
              <span>Expenses:</span>
              <strong>{formatCurrency(trends[activePoint]?.expense || 0)}</strong>
            </div>
          </div>
        )}

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2.5rem',
            marginTop: '0.5rem',
            fontSize: '0.825rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: '12px',
                height: '3px',
                backgroundColor: 'var(--accent-income)',
                borderRadius: '2px',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Income Cash Flow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: '12px',
                height: '3px',
                backgroundColor: 'var(--accent-expense)',
                borderRadius: '2px',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Expense Outflow</span>
          </div>
        </div>
      </div>
    </div>
  );
};
