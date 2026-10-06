import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS = {
  Food: '#f97316',          // Orange
  Transport: '#3b82f6',     // Blue
  Rent: '#8b5cf6',          // Purple
  Bills: '#ef4444',         // Red
  Shopping: '#ec4899',      // Pink
  Health: '#10b981',        // Emerald
  Entertainment: '#eab308', // Yellow
  Other: '#6b7280',         // Gray
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-xs">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</p>
        <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
          ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{data.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ categories = [] }) => {
  const chartData = categories
    .filter((c) => c.total > 0)
    .map((c) => ({
      name: c.category,
      value: c.total,
      percentage: c.percentage,
      color: CATEGORY_COLORS[c.category] || '#94a3b8',
    }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center h-80 text-gray-400 dark:text-gray-500 text-sm">
        <p>No category spending recorded for this month.</p>
        <p className="text-xs mt-1">Add an expense to view breakdown.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Category Breakdown</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Spending proportion by category</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryPieChart;
