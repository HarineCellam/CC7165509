import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';

const Reports = () => {
  const [reportData, setReportData] = useState({
    monthlyExpenses: [],
    monthlyIncome: []
  });
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('yearly');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  useEffect(() => {
    fetchReportData();
    fetchExpenses();
    fetchIncome();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await axios.get('/reports/yearly');
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchIncome = async () => {
    try {
      const response = await axios.get('/income');
      setIncome(response.data);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const getMonthlyData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => {
      const monthNumber = index + 1;
      const expenseData = reportData.monthlyExpenses.find(item => item._id === monthNumber);
      const incomeData = reportData.monthlyIncome.find(item => item._id === monthNumber);
      
      return {
        month,
        expenses: expenseData ? expenseData.expenses : 0,
        income: incomeData ? incomeData.income : 0
      };
    });
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      name: category,
      value: total
    }));
  };

  const getIncomeSourceData = () => {
    const sourceTotals = {};
    income.forEach(inc => {
      sourceTotals[inc.category] = (sourceTotals[inc.category] || 0) + inc.amount;
    });

    return Object.entries(sourceTotals).map(([source, total]) => ({
      name: source,
      value: total
    }));
  };

  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

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
            Financial Reports
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive analysis of your financial data
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Income</p>
              <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Total Expenses</p>
              <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-100" />
          </div>
        </div>

        <div className={`bg-gradient-to-r ${netSavings >= 0 ? 'from-blue-600 to-purple-600' : 'from-orange-600 to-red-600'} rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Net Savings</p>
              <p className="text-2xl font-bold">${Math.abs(netSavings).toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Savings Rate</p>
              <p className="text-2xl font-bold">{savingsRate.toFixed(1)}%</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-100" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income vs Expenses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Sources */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getIncomeSourceData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getIncomeSourceData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Trend */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Savings Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Savings']} />
                <Line 
                  type="monotone" 
                  dataKey={(data) => data.income - data.expenses} 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Monthly Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Top Expense Category</h4>
            <p className="text-blue-700">
              {getCategoryData().length > 0 
                ? getCategoryData().reduce((max, cat) => cat.value > max.value ? cat : max).name
                : 'No data'
              }
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Average Monthly Income</h4>
            <p className="text-green-700">
              ${(totalIncome / 12).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Financial Health</h4>
            <p className="text-purple-700">
              {savingsRate > 20 ? 'Excellent' : savingsRate > 10 ? 'Good' : savingsRate > 0 ? 'Fair' : 'Needs Improvement'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;