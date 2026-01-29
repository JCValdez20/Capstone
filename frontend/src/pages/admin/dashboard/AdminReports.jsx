import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  FileText,
  Printer,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import adminService from "@/services/adminService";

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    confirmedBookings: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const printRef = useRef();

  // Print handler
  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open("", "", "width=800,height=600");
    windowPrint.document.write(`
      <html>
        <head>
          <title>Booking Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #dc2626; margin-bottom: 10px; }
            .meta { color: #666; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .stat-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
            .stat-card .value { font-size: 32px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f9fafb; font-weight: 600; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-confirmed { background-color: #dbeafe; color: #1e40af; }
            .status-completed { background-color: #d1fae5; color: #065f46; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    windowPrint.print();
    windowPrint.close();
  };

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllBookings({ limit: 1000 });
      if (result.success) {
        const bookingsData =
          result.data.data?.bookings || result.data.bookings || [];
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
        calculateStats(bookingsData);
        calculateChartData(bookingsData);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (bookingsData) => {
    const total = bookingsData.length;
    const pending = bookingsData.filter((b) => b.status === "pending").length;
    const confirmed = bookingsData.filter(
      (b) => b.status === "confirmed"
    ).length;
    const completed = bookingsData.filter(
      (b) => b.status === "completed"
    ).length;
    const cancelled = bookingsData.filter(
      (b) => b.status === "cancelled"
    ).length;

    setStats({
      totalBookings: total,
      pendingBookings: pending,
      confirmedBookings: confirmed,
      completedBookings: completed,
      cancelledBookings: cancelled,
    });
  };

  // Calculate chart data
  const calculateChartData = (bookingsData) => {
    // Weekly data (last 7 days)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const count = bookingsData.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate.toDateString() === date.toDateString();
      }).length;
      weekData.push({ day: dayName, bookings: count });
    }
    setWeeklyData(weekData);

    // Monthly data (last 4 weeks)
    const monthData = [];
    for (let i = 3; i >= 0; i--) {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - i * 7);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const count = bookingsData.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startDate && bookingDate <= endDate;
      }).length;

      monthData.push({ week: `Week ${4 - i}`, bookings: count });
    }
    setMonthlyData(monthData);
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(
        (b) => new Date(b.date) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter((b) => new Date(b.date) <= new Date(endDate));
    }

    setFilteredBookings(filtered);
    calculateStats(filtered);
    calculateChartData(filtered);
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setFilteredBookings(bookings);
    calculateStats(bookings);
    calculateChartData(bookings);
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, startDate, endDate]);

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      description: `${stats.pendingBookings} pending`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed Bookings",
      value: stats.completedBookings,
      icon: TrendingUp,
      description: `${
        stats.totalBookings > 0
          ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
          : 0
      }% completion rate`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">
              Overview of your business performance
            </p>
          </div>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Bookings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                Bookings This Week
              </CardTitle>
              <CardDescription>
                Daily booking count for the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-64 border-b border-gray-200 pb-8">
                {weeklyData.map((data, index) => {
                  const maxBookings = Math.max(
                    ...weeklyData.map((d) => d.bookings),
                    1
                  );
                  const heightPercentage = (data.bookings / maxBookings) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center h-full"
                    >
                      <div className="w-full h-full flex flex-col justify-end items-center">
                        <span className="text-xs font-bold text-gray-900 mb-1">
                          {data.bookings}
                        </span>
                        <div
                          className="w-full bg-red-600 rounded-t-lg transition-all duration-500 hover:bg-red-700"
                          style={{
                            height: `${
                              data.bookings > 0 ? heightPercentage : 2
                            }%`,
                            minHeight: data.bookings > 0 ? "8px" : "2px",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2 mt-2">
                {weeklyData.map((data, index) => (
                  <div key={index} className="flex-1 text-center">
                    <span className="text-xs font-medium text-gray-600">
                      {data.day}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Bookings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                Bookings This Month
              </CardTitle>
              <CardDescription>
                Weekly booking count for the current month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-64 border-b border-gray-200 pb-8">
                {monthlyData.map((data, index) => {
                  const maxBookings = Math.max(
                    ...monthlyData.map((d) => d.bookings),
                    1
                  );
                  const heightPercentage = (data.bookings / maxBookings) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center h-full"
                    >
                      <div className="w-full h-full flex flex-col justify-end items-center">
                        <span className="text-xs font-bold text-gray-900 mb-1">
                          {data.bookings}
                        </span>
                        <div
                          className="w-full bg-blue-600 rounded-t-lg transition-all duration-500 hover:bg-blue-700"
                          style={{
                            height: `${
                              data.bookings > 0 ? heightPercentage : 2
                            }%`,
                            minHeight: data.bookings > 0 ? "8px" : "2px",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2 mt-2">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 text-center">
                    <span className="text-xs font-medium text-gray-600">
                      {data.week}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                Booking Status Overview
              </CardTitle>
              <CardDescription>Current booking distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Completed
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats.completedBookings}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats.totalBookings > 0
                            ? (stats.completedBookings / stats.totalBookings) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Pending
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats.pendingBookings}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats.totalBookings > 0
                            ? (stats.pendingBookings / stats.totalBookings) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Confirmed
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats.confirmedBookings}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats.totalBookings > 0
                            ? (stats.confirmedBookings / stats.totalBookings) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Cancelled
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats.cancelledBookings}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats.totalBookings > 0
                            ? (stats.cancelledBookings / stats.totalBookings) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              All Bookings ({filteredBookings.length})
            </CardTitle>
            <CardDescription>
              Complete list of all bookings with applied filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500">No bookings found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-mono text-xs">
                          {booking._id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          {booking.user?.first_name && booking.user?.last_name
                            ? `${booking.user.first_name} ${booking.user.last_name}`
                            : booking.user?.email || "N/A"}
                        </TableCell>
                        <TableCell>
                          {booking.services && booking.services.length > 0
                          ? booking.services.map(s => s.name || s).join(", ")
                            : booking.service || "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(booking.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{booking.timeSlot}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Content (Hidden) */}
      <div ref={printRef} style={{ display: "none" }}>
        <h1>Booking Report</h1>
        <div className="meta">
          <p>
            Generated on: {new Date().toLocaleDateString()} at{" "}
            {new Date().toLocaleTimeString()}
          </p>
          <p>
            Filters Applied: Status: {statusFilter}, Date Range:{" "}
            {startDate || "N/A"} to {endDate || "N/A"}
          </p>
        </div>

        <div className="stats">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <div className="value">{stats.totalBookings}</div>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="value">{stats.completedBookings}</div>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <div className="value">{stats.pendingBookings}</div>
          </div>
          <div className="stat-card">
            <h3>Cancelled</h3>
            <div className="value">{stats.cancelledBookings}</div>
          </div>
        </div>

        <h2>All Bookings</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking._id.slice(-8)}</td>
                <td>
                  {booking.user?.first_name && booking.user?.last_name
                    ? `${booking.user.first_name} ${booking.user.last_name}`
                    : booking.user?.email || "N/A"}
                </td>
                <td>
                  {booking.services && booking.services.length > 0
                    ? booking.services.map(s => s.name || s).join(", ")
                    : booking.service || "N/A"}
                </td>
                <td>{new Date(booking.date).toLocaleDateString()}</td>
                <td>{booking.timeSlot}</td>
                <td>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;
