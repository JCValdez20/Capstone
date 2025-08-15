import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import adminService from "@/services/adminService";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  // const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock data for service bookings (replace with actual API call)
  const serviceBookingData = [
    { service: "Basic Wash", bookings: 45, color: "#ef4444" },
    { service: "Premium Wash", bookings: 32, color: "#f97316" },
    { service: "Full Detailing", bookings: 28, color: "#eab308" },
    { service: "Engine Clean", bookings: 18, color: "#22c55e" },
    { service: "Wax & Polish", bookings: 25, color: "#3b82f6" },
  ];

  // Mock recent bookings data (replace with actual API call)
  const recentBookings = [
    {
      id: 1,
      customer: "John Doe",
      service: "Premium Wash",
      date: "2025-01-15",
      time: "10:00 AM",
      status: "pending",
    },
    {
      id: 2,
      customer: "Jane Smith",
      service: "Basic Wash",
      date: "2025-01-15",
      time: "2:00 PM",
      status: "confirmed",
    },
    {
      id: 3,
      customer: "Mike Johnson",
      service: "Full Detailing",
      date: "2025-01-16",
      time: "9:00 AM",
      status: "pending",
    },
    {
      id: 4,
      customer: "Sarah Wilson",
      service: "Engine Clean",
      date: "2025-01-16",
      time: "11:30 AM",
      status: "confirmed",
    },
    {
      id: 5,
      customer: "Tom Brown",
      service: "Wax & Polish",
      date: "2025-01-17",
      time: "3:00 PM",
      status: "pending",
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      setError("Failed to fetch users: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const currentAdmin = adminService.getCurrentAdmin();
  const totalBookings = serviceBookingData.reduce(
    (sum, item) => sum + item.bookings,
    0
  );
  const pendingBookings = recentBookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  if (loading) {
    return (
      <div className="h-screen bg-white overflow-hidden">
        <div className="h-full p-8 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Main Content Container with Equal Margins */}
      <div className="h-full p-8 flex flex-col">
        <div className="max-w-[1400px] mx-auto space-y-8 flex-1 overflow-auto">
          {/* Enhanced Header Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Welcome back,{" "}
                    {currentAdmin?.name ||
                      `${currentAdmin?.first_name} ${currentAdmin?.last_name}` ||
                      currentAdmin?.email}
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-gray-500">
                      Last updated: {new Date().toLocaleDateString()}
                    </span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600 font-medium">
                      System Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Quick Action
                </Button>
              </div>
            </div>
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

          {/* Enhanced Stats Cards with Better Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Total Users
                </CardTitle>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {users.length}
                </div>
                <p className="text-sm text-gray-600">All registered users</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Total Bookings
                </CardTitle>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {totalBookings}
                </div>
                <p className="text-sm text-gray-600">Across all services</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Pending Approvals
                </CardTitle>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {pendingBookings}
                </div>
                <p className="text-sm text-gray-600">Require attention</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Active Customers
                </CardTitle>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {users.filter((user) => user.roles === "customer").length}
                </div>
                <p className="text-sm text-gray-600">Active customers</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Charts Section with Better Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Bar Chart - Takes 2/3 on large screens */}
            <Card className="xl:col-span-2 bg-white border-0 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Service Booking Analytics
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Number of bookings per service type
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Live Data</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={serviceBookingData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="service"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      tick={{ fill: "#666" }}
                    />
                    <YAxis tick={{ fill: "#666" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart and Quick Stats - Takes 1/3 */}
            <div className="space-y-8">
              <Card className="bg-white border-0 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Service Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Service type breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={serviceBookingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="bookings"
                      >
                        {serviceBookingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="bg-white border-0 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add New User
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50 rounded-xl py-3 font-medium"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50 rounded-xl py-3 font-medium"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Bookings */}
          <Card className="bg-white border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Latest booking requests requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.customer}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.service}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.date}
                      </p>
                      <p className="text-sm text-gray-500">{booking.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === "pending"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {booking.status === "pending" ? "Pending" : "Confirmed"}
                      </span>
                      {booking.status === "pending" && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
