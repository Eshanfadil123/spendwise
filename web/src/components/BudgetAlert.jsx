import React from 'react';
import { AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';

const BudgetAlert = ({ summary, onOpenBudgetModal }) => {
  if (!summary || !summary.monthlyBudget || summary.monthlyBudget <= 0) {
    return (
      <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Set a monthly budget to unlock spending warnings and keep your expenses under control!
          </p>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition whitespace-nowrap ml-4"
        >
          Set Budget
        </button>
      </div>
    );
  }

  const { budgetPercentage, totalSpent, monthlyBudget } = summary;

  // 100% or more exceeded
  if (budgetPercentage >= 100) {
    const overspent = (totalSpent - monthlyBudget).toFixed(2);
    return (
      <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 shadow-sm flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Budget Exceeded! ({budgetPercentage}%)</h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              You have spent <strong>${totalSpent.toLocaleString()}</strong> of your <strong>${monthlyBudget.toLocaleString()}</strong> monthly budget (${overspent} over limit).
            </p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition ml-4 whitespace-nowrap"
        >
          Adjust Budget
        </button>
      </div>
    );
  }

  // 80% to 99% warning
  if (budgetPercentage >= 80) {
    const remaining = (monthlyBudget - totalSpent).toFixed(2);
    return (
      <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-sm flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Budget Warning: {budgetPercentage}% Spent</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              You have reached 80% of your monthly budget. Only <strong>${remaining}</strong> remaining for this month.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition ml-4 whitespace-nowrap"
        >
          Adjust Budget
        </button>
      </div>
    );
  }

  return null;
};

export default BudgetAlert;
