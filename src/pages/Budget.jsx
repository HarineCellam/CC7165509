import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Food',
    budgetAmount: '',
    period: 'monthly',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    alertThreshold: 80
  });

  const categories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Travel', 'Other'];
  const periods = ['weekly', 'monthly', 'yearly'];

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/budget');
      setBudgets(response.data);
    } catch (error) {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses');
    }
  };

  const calculateSpentAmount = (budget) => {
    const budgetStart = new Date(budget.startDate);
    const budgetEnd = new Date(budget.endDate);
    
    return expenses
      .filter(expense => 
        expense.category === budget.category &&
        new Date(expense.date) >= budgetStart &&
        new Date(expense.date) <= budgetEnd
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getBudgetStatus = (spent, budget, threshold) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'red', icon: AlertTriangle };
    if (percentage >= threshold) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'good', color: 'green', icon: CheckCircle };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBudget) {
        await axios.put(`/budget/${editingBudget._id}`, formData);
        toast.success('Budget updated successfully');
      } else {
        await axios.post('/budget', formData);
        toast.success('Budget created successfully');
      }
      
      setShowModal(false);
      setEditingBudget(null);
      setFormData({
        category: 'Food',
        budgetAmount: '',
        period: 'monthly',
        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
        alertThreshold: 80
      });
      fetchBudgets();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      budgetAmount: budget.budgetAmount.toString(),
      period: budget.period,
      startDate: format(new Date(budget.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(budget.endDate), 'yyyy-MM-dd'),
      alertThreshold: budget.alertThreshold
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`/budget/${id}`);
        toast.success('Budget deleted successfully');
        fetchBudgets();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

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
            Budget Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Set and track your spending limits by category
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      {budgets.length === 0 ? (
        <div className="bg-white shadow-lg rounded-xl p-12 text-center border border-gray-100">
          <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets created</h3>
          <p className="text-gray-500 mb-4">Start by creating your first budget to track spending</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spentAmount = calculateSpentAmount(budget);
            const percentage = (spentAmount / budget.budgetAmount) * 100;
            const { status, color, icon: StatusIcon } = getBudgetStatus(spentAmount, budget.budgetAmount, budget.alertThreshold);
            
            return (
              <div key={budget._id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                      <Target className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                      <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium">${spentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium">${budget.budgetAmount.toFixed(2)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        status === 'exceeded' ? 'bg-red-500' :
                        status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <StatusIcon className={`w-4 h-4 text-${color}-600`} />
                      <span className={`text-sm font-medium text-${color}-600`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ${(budget.budgetAmount - spentAmount).toFixed(2)} remaining
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    {format(new Date(budget.startDate), 'MMM dd')} - {format(new Date(budget.endDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {periods.map((period) => (
                      <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Threshold ({formData.alertThreshold}%)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBudget(null);
                      setFormData({
                        category: 'Food',
                        budgetAmount: '',
                        period: 'monthly',
                        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                        endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                        alertThreshold: 80
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    {editingBudget ? 'Update' : 'Create'} Budget
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

export default Budget;