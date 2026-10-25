import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const IncomeExpenseBarChart = ({ income = 0, expenses = 0 }) => {
  const { formatCurrency } = useTheme();

  const maxVal = Math.max(income, expenses, 1);
  const incomeHeightPct = Math.round((income / maxVal) * 100);
  const expenseHeightPct = Math.round((expenses / maxVal) * 100);

  return (
    <div style={{ width: '100%', padding: '1rem 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '3rem',
          height: '180px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '0.5rem',
        }}
      >
        {/* Income Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'flex-end',
            width: '70px',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--accent-income)',
              marginBottom: '0.4rem',
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(income)}
          </div>
          <div
            style={{
              width: '100%',
              height: `${Math.max(incomeHeightPct, 6)}%`,
              backgroundColor: 'var(--accent-income)',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.5s ease',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
            }}
          />
          <div
            style={{
              marginTop: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Income
          </div>
        </div>

        {/* Expenses Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'flex-end',
            width: '70px',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--accent-expense)',
              marginBottom: '0.4rem',
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(expenses)}
          </div>
          <div
            style={{
              width: '100%',
              height: `${Math.max(expenseHeightPct, 6)}%`,
              backgroundColor: 'var(--accent-expense)',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.5s ease',
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.25)',
            }}
          />
          <div
            style={{
              marginTop: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Expenses
          </div>
        </div>
      </div>
    </div>
  );
};
