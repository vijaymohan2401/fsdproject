import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spendwise_theme') || 'dark';
  });

  const [currency, setCurrency] = useState(() => {
    const stored = localStorage.getItem('spendwise_currency');
    if (!stored || stored === 'USD') {
      localStorage.setItem('spendwise_currency', 'INR');
      return 'INR';
    }
    return stored;
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('spendwise_accent') || 'emerald';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spendwise_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    localStorage.setItem('spendwise_accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('spendwise_currency', currency);
  }, [currency]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const getCurrencySymbol = (curr = currency) => {
    switch (curr) {
      case 'USD':
        return '₹'; // Converted dollar symbol to Indian Rupee symbol
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
      default:
        return '₹';
    }
  };

  const formatCurrency = (amount, customCurrency = currency) => {
    const val = Number(amount) || 0;
    const symbol = getCurrencySymbol(customCurrency);

    if (customCurrency === 'INR' || customCurrency === 'USD') {
      // Indian numbering system formatting: 1,50,000.00
      return `${symbol}${val.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `${symbol}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
        currency,
        setCurrency,
        getCurrencySymbol,
        formatCurrency,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
