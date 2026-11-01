import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const IncomeExpenseBarChart = ({ income = 0, expenses = 0 }) => {
  const { formatCurrency } = useTheme();
  const [hovered, setHovered] = useState(null);

  const maxVal = Math.max(income, expenses, 1);
  const incomeHeightPct = Math.round((income / maxVal) * 100);
  const expenseHeightPct = Math.round((expenses / maxVal) * 100);

  // Financial health ratio calculation
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  return (
    <div style={{ width: '100%', padding: '0.5rem 0' }}>
      {/* Top Ratio Summary Tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Net Flow:{' '}
          <strong
            style={{
              color: income >= expenses ? 'var(--accent-income)' : 'var(--accent-expense)',
            }}
          >
            {income >= expenses ? '+' : ''}
            {formatCurrency(income - expenses)}
          </strong>
        </span>
        {income > 0 && (
          <span
            className={`badge ${savingsRate >= 20 ? 'badge-income' : savingsRate > 0 ? 'badge-warning' : 'badge-expense'}`}
          >
            {savingsRate >= 0 ? `${savingsRate}% Saved` : 'Over budget'}
          </span>
        )}
      </div>

      {/* Visual Chart Stage */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '3.5rem',
          height: '170px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
          position: 'relative',
        }}
      >
        {/* Income Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'flex-end',
            width: '64px',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHovered('income')}
          onMouseLeave={() => setHovered(null)}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-income)',
              marginBottom: '0.35rem',
              opacity: hovered === 'income' || hovered === null ? 1 : 0.6,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(income)}
          </div>
          <div
            style={{
              width: '100%',
              height: `${Math.max(incomeHeightPct, 6)}%`,
              background: 'linear-gradient(180deg, var(--accent-income) 0%, rgba(16, 185, 129, 0.75) 100%)',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s',
              transform: hovered === 'income' ? 'scaleY(1.03)' : 'scaleY(1)',
              boxShadow: hovered === 'income' ? '0 0 16px var(--accent-primary-shadow)' : 'none',
            }}
          />
        </div>

        {/* Expense Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'flex-end',
            width: '64px',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHovered('expense')}
          onMouseLeave={() => setHovered(null)}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-expense)',
              marginBottom: '0.35rem',
              opacity: hovered === 'expense' || hovered === null ? 1 : 0.6,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(expenses)}
          </div>
          <div
            style={{
              width: '100%',
              height: `${Math.max(expenseHeightPct, 6)}%`,
              background: 'linear-gradient(180deg, var(--accent-expense) 0%, rgba(244, 63, 94, 0.75) 100%)',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s',
              transform: hovered === 'expense' ? 'scaleY(1.03)' : 'scaleY(1)',
              boxShadow: hovered === 'expense' ? '0 0 16px rgba(244, 63, 94, 0.3)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Axis Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3.5rem',
          paddingTop: '0.6rem',
        }}
      >
        <span
          style={{
            width: '64px',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          Income
        </span>
        <span
          style={{
            width: '64px',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          Expenses
        </span>
      </div>
    </div>
  );
};
