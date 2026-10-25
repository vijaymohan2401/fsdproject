import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const PALETTE = [
  '#10b981', // Emerald
  '#0284c7', // Sky Blue
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#64748b', // Slate
];

export const CategoryDonutChart = ({ categories = [] }) => {
  const { formatCurrency } = useTheme();

  if (!categories || categories.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        <p>No expense data available for the selected month.</p>
        <span style={{ fontSize: '0.825rem', marginTop: '0.35rem' }}>
          Record expenses to visualize category spending.
        </span>
      </div>
    );
  }

  const total = categories.reduce((sum, item) => sum + item.amount, 0);

  // SVG Donut geometry
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '0.5rem 0',
      }}
    >
      {/* SVG Donut Circle */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border-color)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {categories.map((cat, index) => {
            const pct = cat.amount / total;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercent * circumference;
            cumulativePercent += pct;
            const color = PALETTE[index % PALETTE.length];

            return (
              <circle
                key={cat.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Spent</span>
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            {formatCurrency(total)}
          </strong>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flex: 1,
          minWidth: '200px',
        }}
      >
        {categories.slice(0, 5).map((cat, index) => {
          const color = PALETTE[index % PALETTE.length];
          return (
            <div
              key={cat.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'inline-block',
                  }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>{cat.category}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontWeight: 600 }}>
                <span>{formatCurrency(cat.amount)}</span>
                <span style={{ color: 'var(--text-muted)' }}>({cat.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
