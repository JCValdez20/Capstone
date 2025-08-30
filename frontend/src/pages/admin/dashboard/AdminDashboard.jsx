import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import adminService from "@/services/adminService";
import { format } from "date-fns";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, bookingsRes] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllBookings(),
      ]);

      const usersData = usersRes?.data || usersRes || [];
      setUsers(Array.isArray(usersData) ? usersData : []);

      let bookingsData = [];
      if (bookingsRes?.data?.bookings) bookingsData = bookingsRes.data.bookings;
      else if (bookingsRes?.bookings) bookingsData = bookingsRes.bookings;
      else if (Array.isArray(bookingsRes?.data))
        bookingsData = bookingsRes.data;
      else if (Array.isArray(bookingsRes)) bookingsData = bookingsRes;

      setBookings(bookingsData || []);
      setError("");
    } catch (err) {
      setError(
        "Failed to fetch dashboard data: " + (err?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles === "admin").length;
  const staffCount = users.filter((u) => u.roles === "staff").length;
  const customerCount = users.filter((u) => u.roles === "customer").length;

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled"
  ).length;
  const noShowBookings = bookings.filter((b) => b.status === "no-show").length;

  // Filter to only show customers in recent users
  const recentUsers = users
    .filter((user) => user.roles === "customer") // Only include customers
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const recentBookings = bookings
    .slice()
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0)
    )
    .slice(0, 5);

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get role color
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header - UNCHANGED as requested */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="text-sm text-gray-500 font-medium">
                    Last updated: {format(now, "PPPP p")}
                  </span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-600 font-semibold">
                    System Online
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {format(now, "PPPP")}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {format(now, "p")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-50 mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {totalUsers}
                  </p>
                </div>
              </div>
              <div className="flex mt-4 space-x-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getRoleColor(
                    "admin"
                  )}`}
                >
                  Admins: {adminCount}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getRoleColor(
                    "staff"
                  )}`}
                >
                  Staff: {staffCount}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getRoleColor(
                    "customer"
                  )}`}
                >
                  Customers: {customerCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-50 mr-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {totalBookings}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap mt-4 gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    "pending"
                  )}`}
                >
                  Pending: {pendingBookings}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    "confirmed"
                  )}`}
                >
                  Confirmed: {confirmedBookings}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    "completed"
                  )}`}
                >
                  Completed: {completedBookings}
                </span>
                {cancelledBookings > 0 && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      "cancelled"
                    )}`}
                  >
                    Cancelled: {cancelledBookings}
                  </span>
                )}
                {noShowBookings > 0 && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      "no-show"
                    )}`}
                  >
                    No-show: {noShowBookings}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <CardTitle className="text-lg font-medium text-gray-800">
                  Recent Customers
                </CardTitle>
              </div>
              <CardDescription className="text-gray-500">
                Last 5 registered customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers.length > 0 ? (
                <ul className="space-y-4">
                  {recentUsers.map((user) => (
                    <li
                      key={user._id}
                      className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-full p-1 mr-3">
                          <svg
                            className="w-4 h-4 text-gray-500"
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
                        <div>
                          <span className="text-sm font-medium text-gray-800 block">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-xs text-gray-500 block mt-1">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleColor(
                          user.roles
                        )}`}
                      >
                        {user.roles}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No customers found
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <CardTitle className="text-lg font-medium text-gray-800">
                  Recent Bookings
                </CardTitle>
              </div>
              <CardDescription className="text-gray-500">
                Last 5 bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {recentBookings.map((booking) => (
                  <li
                    key={booking._id}
                    className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-1 mr-3">
                        <svg
                          className="w-4 h-4 text-gray-500"
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
                        <span className="text-sm font-medium text-gray-800 block">
                          {booking.user?.first_name} {booking.user?.last_name}
                        </span>
                        <span className="text-xs text-gray-600 block mt-1">
                          {booking.service}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
