import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Salary',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false
  });

  const categories = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await axios.get('/income');
      setIncomes(response.data);
    } catch (error) {
      toast.error('Failed to fetch income data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingIncome) {
        await axios.put(`/income/${editingIncome._id}`, formData);
        toast.success('Income updated successfully');
      } else {
        await axios.post('/income', formData);
        toast.success('Income added successfully');
      }
      
      setShowModal(false);
      setEditingIncome(null);
      setFormData({
        title: '',
        amount: '',
        category: 'Salary',
        description: '',
        date: new Date().toISOString().split('T')[0],
        recurring: false
      });
      fetchIncomes();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      title: income.title,
      amount: income.amount.toString(),
      category: income.category,
      description: income.description || '',
      date: format(new Date(income.date), 'yyyy-MM-dd'),
      recurring: income.recurring
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await axios.delete(`/income/${id}`);
        toast.success('Income deleted successfully');
        fetchIncomes();
      } catch (error) {
        toast.error('Failed to delete income');
      }
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

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
            Income Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your income sources
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-green-100">Total Income</h3>
            <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Income History</h3>
        </div>
        
        {incomes.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No income recorded</h3>
            <p className="text-gray-500 mb-4">Start by adding your first income source</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-lg transition-all"
            >
              Add Income
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {incomes.map((income) => (
              <div key={income._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{income.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {income.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(income.date), 'MMM dd, yyyy')}</span>
                        </div>
                        {income.recurring && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Recurring
                          </span>
                        )}
                      </div>
                      {income.description && (
                        <p className="text-sm text-gray-600 mt-1">{income.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">+${income.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(income)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(income._id)}
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
                {editingIncome ? 'Edit Income' : 'Add New Income'}
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
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                    Recurring income
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingIncome(null);
                      setFormData({
                        title: '',
                        amount: '',
                        category: 'Salary',
                        description: '',
                        date: new Date().toISOString().split('T')[0],
                        recurring: false
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
                  >
                    {editingIncome ? 'Update' : 'Add'} Income
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

export default Income;