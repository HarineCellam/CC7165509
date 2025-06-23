import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Target, DollarSign, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    expensesByCategory: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  const balance = dashboardData.monthlyIncome - dashboardData.monthlyExpenses;

  const quickActions = [
    { name: 'Add Income', href: '/income', icon: TrendingUp, color: 'bg-green-500' },
    { name: 'Add Expense', href: '/expenses', icon: TrendingDown, color: 'bg-red-500' },
    { name: 'Set Budget', href: '/budget', icon: Target, color: 'bg-blue-500' },
    { name: 'View Reports', href: '/reports', icon: DollarSign, color: 'bg-purple-500' },
  ];

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
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
                  <dd className="text-2xl font-bold text-gray-900">${dashboardData.monthlyIncome.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Expenses</dt>
                  <dd className="text-2xl font-bold text-gray-900">${dashboardData.monthlyExpenses.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center`}>
                  <DollarSign className={`w-6 h-6 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Balance</dt>
                  <dd className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    ${Math.abs(balance).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-green-600 overflow-hidden shadow-lg rounded-xl">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100 truncate">Savings Rate</dt>
                  <dd className="text-2xl font-bold text-white">
                    {dashboardData.monthlyIncome > 0 ? ((balance / dashboardData.monthlyIncome) * 100).toFixed(1) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {dashboardData.expensesByCategory.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No expenses data available</p>
                <Link to="/expenses" className="text-blue-600 hover:text-blue-500 font-medium">
                  Add your first expense
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Link to="/expenses" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
              View all
            </Link>
          </div>
          {dashboardData.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.title}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-${transaction.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{format(new Date(transaction.date), 'MMM dd')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent transactions</p>
                <Link to="/expenses" className="text-blue-600 hover:text-blue-500 font-medium">
                  Add your first transaction
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;