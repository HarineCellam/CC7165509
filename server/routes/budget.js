import express from 'express';
import Budget from '../models/Budget.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all budgets for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create budget
router.post('/', authenticateToken, async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      user: req.userId
    });
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update budget
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete budget
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;