import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  recurring: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Income', incomeSchema);