import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  X,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { TransactionModal } from '../components/TransactionModal';
import { ConfirmModal } from '../components/ConfirmModal';

const ALL_CATEGORIES = [
  'All',
  'Food',
  'Transportation',
  'Education',
  'Shopping',
  'Bills and utilities',
  'Entertainment',
  'Healthcare',
  'Subscriptions',
  'Other expenses',
  'Pocket money or allowance',
  'Salary or stipend',
  'Freelance income',
  'Gifts',
  'Other income',
];

export const TransactionsPage = () => {
  const { formatCurrency } = useTheme();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = 'Transactions — SpendWise Record Manager';
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search,
        type: typeFilter,
        category: categoryFilter,
        month: monthFilter,
        sortBy,
        sortOrder,
      };

      const data = await api.get('/transactions', params);
      if (data.success) {
        setTransactions(data.transactions);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to load transactions.' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, typeFilter, categoryFilter, monthFilter, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('All');
    setMonthFilter('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const isFiltered = !!(search || typeFilter || (categoryFilter && categoryFilter !== 'All') || monthFilter);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setDeleteLoading(true);

    try {
      await api.delete(`/transactions/${deletingTransaction._id || deletingTransaction.id}`);
      showToast({ type: 'success', message: 'Transaction removed successfully.' });
      setDeletingTransaction(null);
      fetchTransactions();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Could not delete transaction.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    const query = new URLSearchParams();
    if (typeFilter) query.append('type', typeFilter);
    if (categoryFilter && categoryFilter !== 'All') query.append('category', categoryFilter);
    if (monthFilter) query.append('month', monthFilter);

    const exportUrl = `/api/transactions/export/csv?${query.toString()}`;
    window.open(exportUrl, '_blank');
    showToast({ type: 'info', message: 'Downloading filtered CSV spreadsheet...' });
  };

  return (
    <div className="tx-workspace">
      {/* 1. Header with Title & Action Controls */}
      <div className="tx-header-wrap">
        <div>
          <h2>Transaction Ledger</h2>
          <p>Search, inspect, and manage all your historical income and expense records.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            id="export-csv-btn"
            title="Download CSV spreadsheet"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary"
            id="add-tx-main-btn"
          >
            <PlusCircle size={15} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* 2. Streamlined, Unified Toolbar (NO duplicate dashboard metric cards!) */}
      <div className="tx-toolbar">
        <form onSubmit={handleSearchSubmit} className="tx-toolbar-left">
          {/* Keyword Search */}
          <div className="tx-search-box">
            <Search size={14} className="tx-search-icon" />
            <input
              id="tx-search"
              type="text"
              placeholder="Search description or category..."
              className="tx-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type Segmented Filter Pills */}
          <div className="tx-type-pills" role="group" aria-label="Filter transaction type">
            <button
              type="button"
              className={`tx-type-pill ${typeFilter === '' ? 'active' : ''}`}
              onClick={() => {
                setTypeFilter('');
                setCurrentPage(1);
              }}
            >
              All
            </button>
            <button
              type="button"
              className={`tx-type-pill ${typeFilter === 'income' ? 'active' : ''}`}
              onClick={() => {
                setTypeFilter('income');
                setCurrentPage(1);
              }}
            >
              Inflow
            </button>
            <button
              type="button"
              className={`tx-type-pill ${typeFilter === 'expense' ? 'active' : ''}`}
              onClick={() => {
                setTypeFilter('expense');
                setCurrentPage(1);
              }}
            >
              Outflow
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            id="filter-category"
            className="tx-select-filter"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter category"
          >
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <input
            id="filter-month"
            type="month"
            className="tx-select-filter"
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by month"
            title="Filter by month"
          />

          {/* Reset Filters Shortcut (Shows when filters active) */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              id="reset-filters-btn"
              title="Clear all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </form>

        {/* Live Matching Count & Sort Controls */}
        <div className="tx-toolbar-right">
          <span className="tx-count-tag">
            {totalCount} {totalCount === 1 ? 'record' : 'records'}
          </span>

          <select
            id="filter-sort"
            className="tx-select-filter"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, ord] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(ord);
              setCurrentPage(1);
            }}
            aria-label="Sort transactions"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* 3. High-Density Transactions Data Table */}
      <div className="tx-table-container">
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Retrieving ledger entries...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No transactions found
            </p>
            <p style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
              {isFiltered
                ? 'Try clearing or adjusting your search filters.'
                : 'Start tracking by recording your first transaction.'}
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {isFiltered && (
                <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
              >
                Log Transaction
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tx-table">
              <thead>
                <tr>
                  <th
                    style={{ width: '130px', cursor: 'pointer' }}
                    onClick={() => toggleSort('date')}
                    title="Sort by date"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Date</span>
                      <ArrowUpDown size={12} opacity={sortBy === 'date' ? 1 : 0.4} />
                    </div>
                  </th>
                  <th style={{ width: '110px' }}>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th
                    style={{ textAlign: 'right', width: '150px', cursor: 'pointer' }}
                    onClick={() => toggleSort('amount')}
                    title="Sort by amount"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <ArrowUpDown size={12} opacity={sortBy === 'amount' ? 1 : 0.4} />
                      <span>Amount</span>
                    </div>
                  </th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id || tx.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
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
                        {tx.type === 'income' ? '+ Inflow' : '- Outflow'}
                      </span>
                    </td>
                    <td>
                      <span className="tx-cat-badge">
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor:
                              tx.type === 'income'
                                ? 'var(--accent-income)'
                                : 'var(--accent-expense)',
                            display: 'inline-block',
                          }}
                        />
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {tx.description || <span style={{ opacity: 0.35 }}>—</span>}
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
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsAddModalOpen(true);
                          }}
                          className="icon-button"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit transaction"
                          aria-label={`Edit ${tx.category} entry`}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeletingTransaction(tx)}
                          className="icon-button"
                          style={{
                            width: '28px',
                            height: '28px',
                            color: 'var(--accent-danger)',
                          }}
                          title="Delete transaction"
                          aria-label={`Delete ${tx.category} entry`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination Controls */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Showing page {currentPage} of {totalPages} ({totalCount} total entries)
            </span>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="btn btn-secondary btn-sm"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="btn btn-secondary btn-sm"
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={fetchTransactions}
        initialData={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTransaction}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${deletingTransaction?.type} entry of ${formatCurrency(
          deletingTransaction?.amount || 0
        )} for "${deletingTransaction?.category}"? This cannot be undone.`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingTransaction(null)}
      />
    </div>
  );
};
