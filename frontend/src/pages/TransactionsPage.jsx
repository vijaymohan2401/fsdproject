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
        limit: 8,
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

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setDeleteLoading(true);

    try {
      await api.delete(`/transactions/${deletingTransaction._id || deletingTransaction.id}`);
      showToast({ type: 'success', message: 'Transaction deleted successfully.' });
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
    showToast({ type: 'info', message: 'Generating CSV file with sanitization...' });
  };

  return (
    <div>
      {/* Header with Title and Add Button */}
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
          <h2>Transaction History</h2>
          <p style={{ marginTop: '0.2rem' }}>
            Review, filter, and organize all your income and expense records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            id="export-csv-btn"
            title="Download CSV spreadsheet"
          >
            <Download size={18} />
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
            <PlusCircle size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            {/* Search Input */}
            <div>
              <label className="form-label" htmlFor="tx-search">
                Keyword Search
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="tx-search"
                  type="text"
                  placeholder="Search description/category..."
                  className="form-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="form-label" htmlFor="filter-type">
                Type
              </label>
              <select
                id="filter-type"
                className="form-select"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="form-label" htmlFor="filter-category">
                Category
              </label>
              <select
                id="filter-category"
                className="form-select"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="form-label" htmlFor="filter-month">
                Specific Month
              </label>
              <input
                id="filter-month"
                type="month"
                className="form-input"
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Sort Field & Order */}
            <div>
              <label className="form-label" htmlFor="filter-sort">
                Sort By
              </label>
              <select
                id="filter-sort"
                className="form-select"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, ord] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(ord);
                  setCurrentPage(1);
                }}
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="amount-desc">Amount (Highest First)</option>
                <option value="amount-asc">Amount (Lowest First)</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              id="reset-filters-btn"
            >
              Reset Filters
            </button>
            <button type="submit" className="btn btn-primary btn-sm" id="search-apply-btn">
              <Search size={16} />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>No transactions found</p>
            <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Try adjusting your search criteria or record a new transaction.
            </p>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '1rem' }}
            >
              Record New Transaction
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id || tx.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
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
                        {tx.type === 'income' ? '+ Income' : '- Expense'}
                      </span>
                    </td>
                    <td>
                      <strong>{tx.category}</strong>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {tx.description || '—'}
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
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsAddModalOpen(true);
                          }}
                          className="icon-button"
                          style={{ width: '32px', height: '32px' }}
                          title="Edit transaction"
                          aria-label={`Edit ${tx.category} transaction`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingTransaction(tx)}
                          className="icon-button"
                          style={{
                            width: '32px',
                            height: '32px',
                            color: 'var(--accent-danger)',
                          }}
                          title="Delete transaction"
                          aria-label={`Delete ${tx.category} transaction`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div
            className="pagination"
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {transactions.length} of {totalCount} records (Page {currentPage} of{' '}
              {totalPages})
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="btn btn-secondary btn-sm"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="btn btn-secondary btn-sm"
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
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
        message={`Are you sure you want to delete this ${deletingTransaction?.type} of ${formatCurrency(
          deletingTransaction?.amount || 0
        )} for "${deletingTransaction?.category}"? This action cannot be undone.`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingTransaction(null)}
      />
    </div>
  );
};
