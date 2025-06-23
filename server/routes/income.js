import express from 'express';
import Income from '../models/Income.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all income for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const income = await Income.find({ user: req.userId })
      .sort({ date: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create income
router.post('/', authenticateToken, async (req, res) => {
  try {
    const income = new Income({
      ...req.body,
      user: req.userId
    });
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update income
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete income
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;