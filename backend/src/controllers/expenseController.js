const { Expense, CATEGORIES } = require('../models/Expense');

// @desc    Get all expenses with optional month, category filter, and pagination
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { month, category, page = 1, limit = 20, search } = req.query;

    const query = { userId: req.user._id };

    // Filter by month (format: YYYY-MM)
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
      const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Optional text search in note
    if (search && search.trim()) {
      query.note = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: expenses.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found.',
      });
    }

    res.json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { amount, category, date, note } = req.body;

    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number.',
      });
    }

    if (!category || !CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Category must be one of: ${CATEGORIES.join(', ')}`,
      });
    }

    const expenseDate = date ? new Date(date) : new Date();
    if (isNaN(expenseDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date provided.',
      });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      amount: Number(amount),
      category,
      date: expenseDate,
      note: note ? note.trim() : '',
    });

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found or unauthorized to update.',
      });
    }

    const { amount, category, date, note } = req.body;

    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be a positive number.',
        });
      }
      expense.amount = Number(amount);
    }

    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Category must be one of: ${CATEGORIES.join(', ')}`,
        });
      }
      expense.category = category;
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date provided.',
        });
      }
      expense.date = parsedDate;
    }

    if (note !== undefined) {
      expense.note = note ? note.trim() : '';
    }

    await expense.save();

    res.json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found or unauthorized to delete.',
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
