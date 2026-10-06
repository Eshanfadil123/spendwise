import React from 'react';
import { Download } from 'lucide-react';

const CSVExportButton = ({ expenses = [], month = '' }) => {
  const handleExport = () => {
    if (!expenses.length) {
      alert('No expenses to export.');
      return;
    }

    const headers = ['Date', 'Category', 'Amount', 'Note', 'ID'];
    const rows = expenses.map((exp) => [
      `"${new Date(exp.date).toLocaleDateString()}"`,
      `"${exp.category}"`,
      `"${exp.amount.toFixed(2)}"`,
      `"${(exp.note || '').replace(/"/g, '""')}"`,
      `"${exp._id}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = `spendwise-expenses-${month || 'all'}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={expenses.length === 0}
      className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
      title="Export to CSV"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Export CSV</span>
    </button>
  );
};

export default CSVExportButton;
