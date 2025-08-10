import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import AdminSidebar from "@/components/AdminSidebar";
import adminService from "@/services/adminService";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingBooking, setEditingBooking] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [bookingToReject, setBookingToReject] = useState(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const filters = {};
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }

      const response = await adminService.getAllBookings(filters);
      const bookingsArray = response.data?.bookings || response.data || [];
      setBookings(bookingsArray);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error.message || "Failed to load bookings");
      toast.error("Failed to load bookings", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId, status, notes = "") => {
    try {
      setIsUpdating(true);
      await adminService.updateBookingStatus(bookingId, status, notes);

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status, notes: notes || booking.notes }
            : booking
        )
      );

      toast.success(`Booking ${status} successfully`, {
        description: `The booking has been ${status}`,
      });

      // Refresh to get updated data
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking({
      ...booking,
      date: new Date(booking.date).toISOString().split("T")[0],
    });
    setIsEditDialogOpen(true);
  };

  const handleQuickReject = (booking) => {
    setBookingToReject(booking);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!bookingToReject) return;

    if (!rejectionReason.trim()) {
      toast.error("Rejection reason required", {
        description: "Please provide a valid reason for rejecting this booking",
      });
      return;
    }

    try {
      setIsUpdating(true);
      await adminService.updateBookingStatus(
        bookingToReject._id,
        "rejected",
        bookingToReject.notes || "",
        rejectionReason
      );

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingToReject._id
            ? { ...booking, status: "rejected", rejectionReason }
            : booking
        )
      );

      setIsRejectDialogOpen(false);
      setBookingToReject(null);
      setRejectionReason("");

      toast.success("Booking rejected successfully", {
        description: "The booking has been rejected with the provided reason",
      });

      // Refresh to ensure consistency
      fetchBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("Failed to reject booking", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveBooking = async () => {
    if (!editingBooking) return;

    // Validate rejection reason if status is rejected
    if (editingBooking.status === "rejected" && (!editingBooking.rejectionReason || editingBooking.rejectionReason.trim() === "")) {
      toast.error("Rejection reason required", {
        description: "Please provide a valid reason for rejecting this booking",
      });
      return;
    }

    try {
      setIsUpdating(true);

      // Update booking status with rejection reason if applicable
      const updateData = {
        status: editingBooking.status,
        notes: editingBooking.notes
      };

      if (editingBooking.status === "rejected") {
        updateData.rejectionReason = editingBooking.rejectionReason;
      }

      await adminService.updateBookingStatus(
        editingBooking._id,
        editingBooking.status,
        editingBooking.notes,
        editingBooking.rejectionReason
      );

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking._id === editingBooking._id ? editingBooking : booking
        )
      );

      setIsEditDialogOpen(false);
      setEditingBooking(null);
      setRejectionReason("");

      toast.success("Booking updated successfully", {
        description: editingBooking.status === "rejected" 
          ? "The booking has been rejected with the provided reason"
          : "The booking has been updated with your changes",
      });

      // Refresh to ensure consistency
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      setIsUpdating(true);
      await adminService.deleteBooking(bookingToDelete._id);

      // Remove from local state
      setBookings(
        bookings.filter((booking) => booking._id !== bookingToDelete._id)
      );

      setIsDeleteDialogOpen(false);
      setBookingToDelete(null);

      toast.success("Booking deleted successfully", {
        description: "The booking has been permanently deleted",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === "all") return true;
    return booking.status === filterStatus;
  });

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const noShowCount = bookings.filter((b) => b.status === "no-show").length;
  const rejectedCount = bookings.filter((b) => b.status === "rejected").length;
  const completedCount = bookings.filter(
    (b) => b.status === "completed"
  ).length;

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "no-show":
        return <XCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "border-orange-200 text-orange-800 bg-orange-50";
      case "confirmed":
        return "border-green-200 text-green-800 bg-green-50";
      case "no-show":
        return "border-red-200 text-red-800 bg-red-50";
      case "rejected":
        return "border-red-200 text-red-800 bg-red-50";
      case "completed":
        return "border-blue-200 text-blue-800 bg-blue-50";
      case "cancelled":
        return "border-gray-200 text-gray-800 bg-gray-50";
      default:
        return "border-gray-200 text-gray-800 bg-gray-50";
    }
  };

  // Group bookings by date for calendar-like display
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    const date = new Date(booking.date).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="max-w-[1400px] mx-auto space-y-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary/60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    Loading bookings...
                  </p>
                  <p className="text-sm text-gray-500">
                    Please wait while we fetch the booking data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <AdminSidebar>
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="max-w-[1400px] mx-auto space-y-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="text-center py-12">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 text-lg font-semibold">{error}</p>
                <Button
                  onClick={fetchBookings}
                  className="mt-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Booking Management
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Review and manage customer bookings
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-gray-500">
                      Total: {bookings.length} bookings
                    </span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600 font-medium">
                      Live Updates
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={fetchBookings}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Bookings
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-blue-900">
                  Total Bookings
                </CardTitle>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-blue-900 mb-2">
                  {bookings.length}
                </div>
                <p className="text-sm text-blue-700">All bookings</p>
                <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-orange-900">
                  Pending
                </CardTitle>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-orange-900 mb-2">
                  {pendingCount}
                </div>
                <p className="text-sm text-orange-700">Require attention</p>
                <div className="mt-4 w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{
                      width: `${
                        bookings.length > 0
                          ? (pendingCount / bookings.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-green-900">
                  Confirmed
                </CardTitle>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-green-900 mb-2">
                  {confirmedCount}
                </div>
                <p className="text-sm text-green-700">Ready to serve</p>
                <div className="mt-4 w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        bookings.length > 0
                          ? (confirmedCount / bookings.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-red-900">
                  No Show
                </CardTitle>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-red-900 mb-2">
                  {noShowCount}
                </div>
                <p className="text-sm text-red-700">Did not show up</p>
                <div className="mt-4 w-full bg-red-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${
                        bookings.length > 0
                          ? (noShowCount / bookings.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-orange-900">
                  Rejected
                </CardTitle>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-orange-900 mb-2">
                  {rejectedCount}
                </div>
                <p className="text-sm text-orange-700">Admin rejected</p>
                <div className="mt-4 w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{
                      width: `${
                        bookings.length > 0
                          ? (rejectedCount / bookings.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Section */}
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Filter Bookings
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Filter by status to manage bookings
                  </CardDescription>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">
                    {Object.keys(bookingsByDate).length} booking days
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex h-12 w-full sm:w-64 rounded-xl border border-gray-300 bg-background px-4 py-3 text-base font-medium focus:border-green-500 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Display */}
          <div className="space-y-6">
            {Object.entries(bookingsByDate)
              .sort()
              .map(([date, dateBookings]) => (
                <Card
                  key={date}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span>
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        {dateBookings.length} booking
                        {dateBookings.length !== 1 ? "s" : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dateBookings
                        .sort((a, b) =>
                          (a.timeSlot || a.time || "").localeCompare(
                            b.timeSlot || b.time || ""
                          )
                        )
                        .map((booking) => (
                          <div
                            key={booking._id}
                            className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-gray-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-lg">
                                      {booking.timeSlot || booking.time}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`flex items-center space-x-1 ${getStatusColor(
                                      booking.status
                                    )}`}
                                  >
                                    {getStatusIcon(booking.status)}
                                    <span className="capitalize">
                                      {booking.status}
                                    </span>
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <User className="w-4 h-4 text-gray-500" />
                                      <div>
                                        <p className="font-medium">
                                          {booking.user?.first_name &&
                                          booking.user?.last_name
                                            ? `${booking.user.first_name} ${booking.user.last_name}`
                                            : booking.user?.email
                                            ? "Customer"
                                            : "Legacy Booking"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {booking.user?.email ||
                                            "Email not available"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                      <p className="text-sm">
                                        <strong>Service:</strong>{" "}
                                        {booking.service}
                                      </p>
                                      <p className="text-sm">
                                        <strong>Vehicle:</strong>{" "}
                                        {booking.vehicle || "Motorcycle"}
                                      </p>
                                      <p className="text-sm">
                                        <strong>Booking ID:</strong>{" "}
                                        {booking._id}
                                      </p>
                                    </div>
                                  </div>

                                  {booking.notes && (
                                    <div className="bg-white p-3 rounded border">
                                      <p className="text-sm font-medium text-gray-700">
                                        Customer Notes:
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {booking.notes}
                                      </p>
                                    </div>
                                  )}

                                  {booking.status === "rejected" && booking.rejectionReason && (
                                    <div className="bg-red-50 p-3 rounded border border-red-200">
                                      <p className="text-sm font-medium text-red-800">
                                        Rejection Reason:
                                      </p>
                                      <p className="text-sm text-red-700">
                                        {booking.rejectionReason}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col space-y-2 ml-4">
                                {booking.status === "pending" && (
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          booking._id,
                                          "confirmed"
                                        )
                                      }
                                      disabled={isUpdating}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      onClick={() => handleQuickReject(booking)}
                                      disabled={isUpdating}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}

                                {booking.status === "confirmed" && (
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          booking._id,
                                          "completed"
                                        )
                                      }
                                      disabled={isUpdating}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Complete
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          booking._id,
                                          "no-show"
                                        )
                                      }
                                      disabled={isUpdating}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      No Show
                                    </Button>
                                  </div>
                                )}

                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditBooking(booking)}
                                    disabled={isUpdating}
                                  >
                                    <Edit3 className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                      setBookingToDelete(booking);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    disabled={isUpdating}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

            {Object.keys(bookingsByDate).length === 0 && (
              <Card className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No bookings found</p>
                  <p className="text-gray-400 text-sm">
                    {filterStatus === "all"
                      ? "Bookings will appear here when customers make reservations"
                      : `No ${filterStatus} bookings found`}
                  </p>
                  <Button
                    onClick={() => setFilterStatus("all")}
                    className="mt-4"
                    variant="outline"
                  >
                    Show All Bookings
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Edit Booking Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Booking</DialogTitle>
                <DialogDescription>
                  Update booking details and status
                </DialogDescription>
              </DialogHeader>

              {editingBooking && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Input
                        id="customer"
                        value={
                          editingBooking.user?.first_name &&
                          editingBooking.user?.last_name
                            ? `${editingBooking.user.first_name} ${editingBooking.user.last_name}`
                            : editingBooking.user?.email
                            ? "Customer"
                            : "Legacy Booking"
                        }
                        disabled
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="service">Service</Label>
                      <Input
                        id="service"
                        value={editingBooking.service}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={editingBooking.date}
                        disabled
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        value={editingBooking.timeSlot || editingBooking.time}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingBooking.status}
                      onValueChange={(value) =>
                        setEditingBooking({ ...editingBooking, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editingBooking.notes || ""}
                      onChange={(e) =>
                        setEditingBooking({
                          ...editingBooking,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Add any notes about this booking..."
                      className="resize-none"
                      rows={4}
                    />
                  </div>

                  {editingBooking.status === "rejected" && (
                    <div className="grid gap-2">
                      <Label htmlFor="rejectionReason" className="text-red-700 font-medium">
                        Rejection Reason *
                      </Label>
                      <Textarea
                        id="rejectionReason"
                        value={editingBooking.rejectionReason || rejectionReason}
                        onChange={(e) => {
                          setRejectionReason(e.target.value);
                          setEditingBooking({
                            ...editingBooking,
                            rejectionReason: e.target.value,
                          });
                        }}
                        placeholder="Please provide a clear reason for rejecting this booking..."
                        className="resize-none border-red-200 focus:border-red-500 focus:ring-red-500"
                        rows={3}
                        required
                      />
                      <p className="text-sm text-red-600">
                        A rejection reason is required when rejecting a booking.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveBooking}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this booking? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>

              {bookingToDelete && (
                <div className="py-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">
                      {bookingToDelete.user?.first_name &&
                      bookingToDelete.user?.last_name
                        ? `${bookingToDelete.user.first_name} ${bookingToDelete.user.last_name}`
                        : bookingToDelete.user?.email
                        ? "Customer"
                        : "Legacy Booking"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookingToDelete.service} -{" "}
                      {new Date(bookingToDelete.date).toLocaleDateString()} at{" "}
                      {bookingToDelete.timeSlot || bookingToDelete.time}
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteBooking}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Deleting..." : "Delete Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Booking Dialog */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-800">Reject Booking</DialogTitle>
                <DialogDescription>
                  Please provide a clear reason for rejecting this booking. This reason will be visible to the customer.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {bookingToReject && (
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm font-medium text-gray-700">
                      Booking Details:
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookingToReject.service} - {new Date(bookingToReject.date).toLocaleDateString()} at {bookingToReject.timeSlot || bookingToReject.time}
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer: {bookingToReject.user?.first_name} {bookingToReject.user?.last_name}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason" className="text-red-700 font-medium">
                    Rejection Reason *
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejecting this booking (e.g., slot no longer available, maintenance scheduled, etc.)"
                    className="border-red-200 focus:border-red-500 focus:ring-red-500"
                    rows={4}
                  />
                  <p className="text-sm text-red-600">
                    This reason will be shown to the customer.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason("");
                    setBookingToReject(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmReject}
                  disabled={isUpdating || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isUpdating ? "Rejecting..." : "Reject Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminBookings;
