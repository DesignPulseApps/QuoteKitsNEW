import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Calculator, 
  DollarSign, 
  BarChart3, 
  MessageSquare, 
  Settings,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Crown,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  openTickets: number;
  totalCalculators: number;
  quotesGenerated: number;
  conversionRate: number;
  churnRate: number;
}

interface User {
  id: string;
  email: string;
  fullName: string | null;
  subscriptionStatus: string;
  quotesUsedThisMonth: number;
  quotesLimit: number;
  createdAt: string;
}

interface Calculator {
  id: number;
  name: string;
  category: string;
  description: string | null;
  createdAt: string;
}

interface Ticket {
  id: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Check if already authenticated for admin
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@quotekit.ai' && adminPassword === 'admin123') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid credentials');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@quotekit.ai"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin123"
                required
              />
            </div>
            {authError && (
              <div className="text-red-500 text-sm">{authError}</div>
            )}
            <Button type="submit" className="w-full">
              Login to Admin Dashboard
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Mock data for demo
  const stats: AdminStats = {
    totalUsers: 1247,
    activeSubscriptions: 892,
    totalRevenue: 45670,
    openTickets: 23,
    totalCalculators: 67,
    quotesGenerated: 15432,
    conversionRate: 12.4,
    churnRate: 3.2
  };

  const users: User[] = [
    {
      id: '1',
      email: 'john@business.com',
      fullName: 'John Smith',
      subscriptionStatus: 'pro',
      quotesUsedThisMonth: 18,
      quotesLimit: 25,
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      email: 'sarah@studio.com',
      fullName: 'Sarah Johnson',
      subscriptionStatus: 'business',
      quotesUsedThisMonth: 32,
      quotesLimit: 50,
      createdAt: '2025-01-10T14:20:00Z'
    },
    {
      id: '3',
      email: 'mike@services.com',
      fullName: 'Mike Wilson',
      subscriptionStatus: 'free',
      quotesUsedThisMonth: 4,
      quotesLimit: 5,
      createdAt: '2025-01-20T09:15:00Z'
    }
  ];

  const calculators: Calculator[] = [
    {
      id: 1,
      name: 'Portrait Photography Calculator',
      category: 'photography',
      description: 'Professional portrait photography pricing calculator',
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Wedding Photography Calculator',
      category: 'photography',
      description: 'Wedding photography pricing with packages',
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Electrician Calculator',
      category: 'home-services',
      description: 'Electrical work pricing calculator',
      createdAt: '2025-01-01T00:00:00Z'
    }
  ];

  const tickets: Ticket[] = [
    {
      id: '1',
      email: 'customer@example.com',
      subject: 'Calculator not loading',
      message: 'The portrait photography calculator is not loading on my website.',
      priority: 'high',
      status: 'open',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'user@business.com',
      subject: 'Billing question',
      message: 'I need to upgrade my plan but cannot find the option.',
      priority: 'normal',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue Trend (Last 30 Days)',
      },
    },
  };

  const revenueData = {
    labels: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue (€)',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000) + 200),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const userDistributionData = {
    labels: ['Free Plan', 'Pro Plan', 'Business Plan', 'Enterprise'],
    datasets: [
      {
        data: [65, 25, 8, 2],
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#10b981',
          '#8b5cf6',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QuoteKit Admin</h1>
            <p className="text-gray-600">Complete control over your SaaS platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              System Healthy
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="calculators" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Calculators</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Support</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                    <p className="text-sm text-green-600 mt-1">↗ +12% this month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</p>
                    <p className="text-sm text-green-600 mt-1">↗ +8% this month</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Crown className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">€{(stats?.totalRevenue || 0).toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-1">↗ +24% this month</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.openTickets || 0}</p>
                    <p className="text-sm text-red-600 mt-1">↗ +3 today</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <Line data={revenueData} options={chartOptions} />
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
                <div className="h-80">
                  <Doughnut data={userDistributionData} />
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users?.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={user.subscriptionStatus === 'free' ? 'secondary' : 'default'}
                            className={
                              user.subscriptionStatus === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                              user.subscriptionStatus === 'business' ? 'bg-green-100 text-green-800' :
                              user.subscriptionStatus === 'pro' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {user.subscriptionStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {user.quotesUsedThisMonth}/{user.quotesLimit} quotes
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(user.quotesUsedThisMonth / user.quotesLimit) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Other tabs would go here... */}
          <TabsContent value="calculators">
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calculator Management</h3>
              <p className="text-gray-500">Manage calculator templates and configurations</p>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Analytics</h3>
              <p className="text-gray-500">Detailed revenue tracking and Stripe integration</p>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Support Tickets</h3>
              <p className="text-gray-500">Manage customer support and tickets</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
              <p className="text-gray-500">API keys, system logs, and configuration</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}