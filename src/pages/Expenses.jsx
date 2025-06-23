import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, TrendingDown, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash'
  });

  const categories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Travel', 'Other'];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'];

  const categoryIcons = {
    Food: '🍽️',
    Transportation: '🚗',
    Shopping: '🛍️',
    Entertainment: '🎮',
    Bills: '📋',
    Healthcare: '🏥',
    Education: '📚',
    Travel: '✈️',
    Other: '📦'
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await axios.put(`/expenses/${editingExpense._id}`, formData);
        toast.success('Expense updated successfully');
      } else {
        await axios.post('/expenses', formData);
        toast.success('Expense added successfully');
      }
      
      setShowModal(false);
      setEditingExpense(null);
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash'
      });
      fetchExpenses();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      paymentMethod: expense.paymentMethod
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/expenses/${id}`);
        toast.success('Expense deleted successfully');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Expense Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and categorize your expenses
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-100">Total Expenses</h3>
            <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <TrendingDown className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Expense History</h3>
        </div>
        
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingDown className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded</h3>
            <p className="text-gray-500 mb-4">Start by adding your first expense</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg transition-all"
            >
              Add Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <div key={expense._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                      {categoryIcons[expense.category]}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{expense.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          {expense.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="w-4 h-4" />
                          <span>{expense.paymentMethod}</span>
                        </div>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">-${expense.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingExpense(null);
                      setFormData({
                        title: '',
                        amount: '',
                        category: 'Food',
                        description: '',
                        date: new Date().toISOString().split('T')[0],
                        paymentMethod: 'Cash'
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all"
                  >
                    {editingExpense ? 'Update' : 'Add'} Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;