import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import BudgetAlert from '../components/BudgetAlert';
import CategoryPieChart from '../components/CategoryPieChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import BudgetModal from '../components/BudgetModal';
import CSVExportButton from '../components/CSVExportButton';
import { PlusCircle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const currentMonthStr = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [allMonthExpensesForExport, setAllMonthExpensesForExport] = useState([]);

  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get(`/api/summary?month=${selectedMonth}`);
      if (res.data.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  }, [selectedMonth]);

  // Fetch expenses with filters & pagination
  const fetchExpenses = useCallback(async () => {
    try {
      setLoadingExpenses(true);
      const params = new URLSearchParams({
        month: selectedMonth,
        page: page.toString(),
        limit: '15',
      });
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await api.get(`/api/expenses?${params.toString()}`);
      if (res.data.success) {
        setExpenses(res.data.expenses);
        setPagination({
          page: res.data.page,
          totalPages: res.data.totalPages,
          total: res.data.total,
        });
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  }, [selectedMonth, selectedCategory, searchQuery, page]);

  // Fetch all expenses of the selected month for full CSV export
  const fetchExportData = useCallback(async () => {
    try {
      const res = await api.get(`/api/expenses?month=${selectedMonth}&limit=1000`);
      if (res.data.success) {
        setAllMonthExpensesForExport(res.data.expenses);
      }
    } catch (err) {
      console.error('Failed to fetch export data:', err);
    }
  }, [selectedMonth]);

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([fetchSummary(), fetchExpenses(), fetchExportData()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSummary();
    fetchExportData();
  }, [fetchSummary, fetchExportData]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <Navbar onOpenBudgetModal={() => setIsBudgetModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Financial Overview
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Logged in as <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.name}</span> • Showing records for {selectedMonth}
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <CSVExportButton
              expenses={allMonthExpensesForExport.length ? allMonthExpensesForExport : expenses}
              month={selectedMonth}
            />

            <button
              onClick={handleOpenAddExpense}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Budget Warning Banner (FR-7: 80% & 100% warning) */}
        <BudgetAlert summary={summary} onOpenBudgetModal={() => setIsBudgetModalOpen(true)} />

        {/* Metric Cards */}
        <SummaryCards
          summary={summary}
          totalCount={pagination.total}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Visual Charts (FR-6) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CategoryPieChart categories={summary?.byCategory || []} />
          <MonthlyTrendChart trendData={summary?.monthlyTrend || []} />
        </div>

        {/* Expense Management Table (FR-2, FR-3) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction History</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Search, filter, and manage your records</p>
            </div>
          </div>

          <ExpenseTable
            expenses={expenses}
            loading={loadingExpenses}
            pagination={pagination}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            selectedMonth={selectedMonth}
            onMonthChange={(m) => {
              setSelectedMonth(m);
              setPage(1);
            }}
            searchQuery={searchQuery}
            onSearchChange={(query) => {
              setSearchQuery(query);
              setPage(1);
            }}
            onPageChange={(p) => setPage(p)}
            onEditExpense={handleOpenEditExpense}
            onRefresh={refreshAll}
          />
        </div>
      </main>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseToEdit={expenseToEdit}
        onSuccess={refreshAll}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={user?.monthlyBudget}
        onBudgetUpdated={refreshAll}
      />
    </div>
  );
};

export default DashboardPage;
