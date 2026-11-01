import React, { useState } from 'react';
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

export const CategoryDonutChart = ({ categories = [], compact = false }) => {
  const { formatCurrency } = useTheme();
  const [activeCategory, setActiveCategory] = useState(null);

  if (!categories || categories.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.9rem' }}>No expense records in this reporting period.</p>
        <span style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
          Record expenses to view category breakdown.
        </span>
      </div>
    );
  }

  const total = categories.reduce((sum, item) => sum + item.amount, 0);

  // Geometry
  const size = compact ? 140 : 160;
  const strokeWidth = compact ? 20 : 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const currentDisplayItem = activeCategory
    ? categories.find((c) => c.category === activeCategory)
    : null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? '1.25rem' : '1.75rem',
        padding: '0.5rem 0',
      }}
    >
      {/* SVG Donut Circle */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Base track */}
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
            const pct = cat.amount / (total || 1);
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercent * circumference;
            cumulativePercent += pct;
            const color = PALETTE[index % PALETTE.length];
            const isHovered = activeCategory === cat.category;

            return (
              <circle
                key={cat.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  opacity: activeCategory && !isHovered ? 0.45 : 1,
                }}
                onMouseEnter={() => setActiveCategory(cat.category)}
                onMouseLeave={() => setActiveCategory(null)}
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
            padding: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {currentDisplayItem ? currentDisplayItem.category : 'Total Spent'}
          </span>
          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '1px' }}>
            {currentDisplayItem
              ? formatCurrency(currentDisplayItem.amount)
              : formatCurrency(total)}
          </strong>
          {currentDisplayItem && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {currentDisplayItem.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          flex: 1,
          minWidth: '180px',
        }}
      >
        {categories.slice(0, 5).map((cat, index) => {
          const color = PALETTE[index % PALETTE.length];
          const isSelected = activeCategory === cat.category;

          return (
            <div
              key={cat.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                padding: '0.2rem 0.4rem',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={() => setActiveCategory(cat.category)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cat.category}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', fontWeight: 600, flexShrink: 0 }}>
                <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.amount)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  ({cat.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
