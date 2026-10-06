import React from 'react';
import { DollarSign, PieChart, ShieldCheck, ArrowUpRight, TrendingDown } from 'lucide-react';

const SummaryCards = ({ summary, onOpenBudgetModal, totalCount }) => {
  const totalSpent = summary?.totalSpent || 0;
  const budget = summary?.monthlyBudget || 0;
  const remaining = summary?.remaining || 0;
  const percentage = summary?.budgetPercentage || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Spent */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Spent
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            {totalCount !== undefined ? `${totalCount} transactions logged` : 'Current month total'}
          </p>
        </div>
      </div>

      {/* Monthly Budget */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Monthly Budget
          </span>
          <button
            onClick={onOpenBudgetModal}
            className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/60 transition"
            title="Edit monthly budget"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ${budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {budget > 0 ? `${percentage}% used` : 'No budget set'}
            </span>
            <button
              onClick={onOpenBudgetModal}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Adjust
            </button>
          </div>
        </div>
        {budget > 0 && (
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100
                  ? 'bg-red-500'
                  : percentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        )}
      </div>

      {/* Remaining Budget */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Remaining Budget
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              percentage >= 100
                ? 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {percentage >= 100 ? <ArrowUpRight className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-3">
          <h3
            className={`text-2xl font-bold ${
              percentage >= 100
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {percentage >= 100 ? 'Limit exceeded' : 'Available to spend'}
          </p>
        </div>
      </div>

      {/* Categories Breakdown Count */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Top Category
          </span>
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          {summary?.byCategory && summary.byCategory.length > 0 && summary.byCategory[0].total > 0 ? (
            <>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {summary.byCategory[0].category}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ${summary.byCategory[0].total.toLocaleString()} ({summary.byCategory[0].percentage}%)
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500">None yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No expenses in this period</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
