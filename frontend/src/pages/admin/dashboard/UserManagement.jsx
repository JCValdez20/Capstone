import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Mail, Calendar, Shield, User } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import adminService from '@/services/adminService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      setError('Failed to fetch users: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      setError('Failed to delete user: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.roles === filterRole;
    return matchesSearch && matchesRole;
  });

  const currentAdmin = adminService.getCurrentAdmin();
  const customerCount = users.filter(user => user.roles === 'customer').length;
  const adminCount = users.filter(user => user.roles === 'admin').length;
  const googleUserCount = users.filter(user => user.isGoogleUser).length;

  if (loading) {
    return (
      <AdminSidebar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  };

  return (
    <AdminSidebar>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
                  <p className="text-lg text-gray-600 mt-2">Manage all users and their account types</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-gray-500">Total: {users.length} users</span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm text-blue-600 font-medium">Live Data</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add New User
                </Button>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Users
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-blue-900">Total Users</CardTitle>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-blue-900 mb-2">{users.length}</div>
                <p className="text-sm text-blue-700">All registered accounts</p>
                <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-green-900">Customers</CardTitle>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-green-900 mb-2">{customerCount}</div>
                <p className="text-sm text-green-700">
                  {users.length > 0 ? Math.round((customerCount / users.length) * 100) : 0}% of total users
                </p>
                <div className="mt-4 w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: `${users.length > 0 ? (customerCount / users.length) * 100 : 0}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-red-900">Administrators</CardTitle>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-red-900 mb-2">{adminCount}</div>
                <p className="text-sm text-red-700">
                  {users.length > 0 ? Math.round((adminCount / users.length) * 100) : 0}% of total users
                </p>
                <div className="mt-4 w-full bg-red-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: `${users.length > 0 ? (adminCount / users.length) * 100 : 0}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-purple-900">Google Users</CardTitle>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-purple-900 mb-2">{googleUserCount}</div>
                <p className="text-sm text-purple-700">Signed up via Google OAuth</p>
                <div className="mt-4 w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: `${users.length > 0 ? (googleUserCount / users.length) * 100 : 0}%`}}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filters and Search */}
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Filter & Search Users</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">Find specific users or filter by role</CardDescription>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">{filteredUsers.length} results</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 text-base rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="flex h-12 w-full sm:w-48 rounded-xl border border-gray-300 bg-background px-4 py-3 text-base font-medium focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="admin">Administrators</option>
                  </select>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-300 hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                    Advanced Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <CardDescription>Complete list of users with account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Account Type</th>
                      <th className="text-left p-4 font-medium">Auth Method</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {user._id?.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="outline" 
                            className={user.roles === 'admin' 
                              ? 'border-red-200 text-red-800 bg-red-50' 
                              : 'border-blue-200 text-blue-800 bg-blue-50'
                            }
                          >
                            {user.roles === 'admin' ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Administrator
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3 mr-1" />
                                Customer
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="outline"
                            className={user.isGoogleUser 
                              ? 'border-green-200 text-green-800 bg-green-50'
                              : 'border-gray-200 text-gray-800 bg-gray-50'
                            }
                          >
                            {user.isGoogleUser ? 'Google OAuth' : 'Email/Password'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={user.roles === 'admin' && user._id === currentAdmin?.id}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No users found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default UserManagement;