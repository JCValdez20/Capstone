import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, Calendar, Shield, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { getAllUsers } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      setError("Failed to fetch users: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    // Only show customers
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    const isCustomer = roles.includes("customer");
    return matchesSearch && isCustomer;
  });

  const customerCount = users.filter((user) => {
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return roles.includes("customer");
  }).length;

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-white">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white">
      <div className="w-full flex flex-col h-full">
        {/* Compact Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Customer Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage customer accounts and information
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-500">
                    Total: {customerCount} customers
                  </span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm text-blue-600 font-medium">
                    Live Data
                  </span>
                </div>
              </div>
            </div>

            {/* Removed Add New User button */}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="w-full space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Total Customers
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {customerCount}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Filtered Results
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {filteredUsers.length}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                        <Search className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-xl border-red-200 bg-red-50"
                >
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Filter and Table Content */}
              <div className="space-y-6">
                {/* Enhanced Filters and Search */}
                <Card className="bg-white rounded-xl shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          Search Customers
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Find specific customers by name or email
                        </CardDescription>
                      </div>
                      <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-xl">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          {filteredUsers.length} results
                        </span>
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
                    </div>
                  </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="bg-white rounded-xl shadow-sm border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      All Customers ({filteredUsers.length})
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Complete list of customer accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Email</th>
                            <th className="text-left p-4 font-medium">
                              Account Type
                            </th>
                            {/* Removed Actions column header */}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr
                              key={user._id}
                              className="border-b hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.first_name?.charAt(0)}
                                      {user.last_name?.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {user.first_name} {user.last_name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-900">
                                    {user.email}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant="outline"
                                  className="border-blue-200 text-blue-800 bg-blue-50"
                                >
                                  <User className="w-3 h-3 mr-1" />
                                  Customer
                                </Badge>
                              </td>
                              {/* Removed Actions cell */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">
                            No customers found
                          </p>
                          <p className="text-gray-400 text-sm">
                            Try adjusting your search criteria
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
