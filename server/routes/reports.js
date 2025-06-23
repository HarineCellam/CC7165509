import express from 'express';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard summary
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Monthly totals
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyIncome = await Income.aggregate([
      {
        $match: {
          user: req.userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Category breakdown
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          user: req.userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Recent transactions
    const recentTransactions = await Expense.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      monthlyExpenses: monthlyExpenses[0]?.total || 0,
      monthlyIncome: monthlyIncome[0]?.total || 0,
      expensesByCategory,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get yearly report
router.get('/yearly', authenticateToken, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const monthlyData = await Expense.aggregate([
      {
        $match: {
          user: req.userId,
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          expenses: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const monthlyIncomeData = await Income.aggregate([
      {
        $match: {
          user: req.userId,
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          income: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      monthlyExpenses: monthlyData,
      monthlyIncome: monthlyIncomeData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;