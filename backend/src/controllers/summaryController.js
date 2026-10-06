const { Expense, CATEGORIES } = require('../models/Expense');

// @desc    Get monthly expense summary, category breakdown, budget analysis & historical trends
// @route   GET /api/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const { month } = req.query;

    // Determine target month and year
    let targetYear, targetMonth;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      targetYear = y;
      targetMonth = m;
    } else {
      const now = new Date();
      targetYear = now.getUTCFullYear();
      targetMonth = now.getUTCMonth() + 1;
    }

    const formattedTargetMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

    // Aggregate category totals for target month
    const categoryAggregation = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    let totalSpent = 0;
    const categoryTotalsMap = {};
    categoryAggregation.forEach((item) => {
      categoryTotalsMap[item._id] = {
        total: parseFloat(item.total.toFixed(2)),
        count: item.count,
      };
      totalSpent += item.total;
    });
    totalSpent = parseFloat(totalSpent.toFixed(2));

    // Build complete category breakdown with percentage
    const byCategory = CATEGORIES.map((cat) => {
      const data = categoryTotalsMap[cat] || { total: 0, count: 0 };
      const percentage = totalSpent > 0 ? parseFloat(((data.total / totalSpent) * 100).toFixed(1)) : 0;
      return {
        category: cat,
        total: data.total,
        count: data.count,
        percentage,
      };
    }).sort((a, b) => b.total - a.total);

    // Budget Calculations
    const monthlyBudget = req.user.monthlyBudget || 0;
    const remaining = monthlyBudget > 0 ? parseFloat(Math.max(0, monthlyBudget - totalSpent).toFixed(2)) : 0;
    const budgetPercentage =
      monthlyBudget > 0 ? parseFloat(((totalSpent / monthlyBudget) * 100).toFixed(1)) : 0;

    let budgetWarning = 'normal';
    if (monthlyBudget > 0) {
      if (budgetPercentage >= 100) {
        budgetWarning = 'exceeded';
      } else if (budgetPercentage >= 80) {
        budgetWarning = 'warning';
      }
    }

    // Historical 6-month trends for Line/Bar chart
    const trendMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(targetYear, targetMonth - 1 - i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
      const mStart = new Date(Date.UTC(y, m - 1, 1));
      const mEnd = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
      trendMonths.push({ key, label, mStart, mEnd });
    }

    const sixMonthsStart = trendMonths[0].mStart;
    const monthlyAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: sixMonthsStart, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const trendMap = {};
    monthlyAgg.forEach((item) => {
      const k = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      trendMap[k] = parseFloat(item.total.toFixed(2));
    });

    const monthlyTrend = trendMonths.map((tm) => ({
      month: tm.key,
      label: tm.label,
      totalSpent: trendMap[tm.key] || 0,
    }));

    res.json({
      success: true,
      month: formattedTargetMonth,
      totalSpent,
      monthlyBudget,
      remaining,
      budgetPercentage,
      budgetWarning,
      byCategory,
      monthlyTrend,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
