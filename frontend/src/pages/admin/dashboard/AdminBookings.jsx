import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Search,
  RefreshCw,
  MoreVertical,
  FileText,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Car,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    pending: true,
    confirmed: true,
    completed: true,
    cancelled: true,
    rejected: true,
    "no-show": true,
  });
  const { getAllBookings, updateBookingStatus, updateBooking } = useAuth();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate date range: one month ago to current month
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      // Format dates as YYYY-MM-DD
      const startDate = oneMonthAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      const response = await getAllBookings({
        startDate,
        endDate
      });

      let bookingsData = [];

      if (response && response.bookings && Array.isArray(response.bookings)) {
        bookingsData = response.bookings;
      } else if (
        response &&
        response.data &&
        response.data.bookings &&
        Array.isArray(response.data.bookings)
      ) {
        bookingsData = response.data.bookings;
      } else if (response && response.data && Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response && Array.isArray(response)) {
        bookingsData = response;
      }

      setBookings(bookingsData);
      setError("");
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [getAllBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId, status, notes = "") => {
    try {
      setIsUpdating(true);
      await updateBookingStatus(bookingId, status, notes);

      const currentBookings = Array.isArray(bookings) ? bookings : [];
      setBookings(
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status, notes: notes || booking.notes }
            : booking
        )
      );

      toast.success(`Booking ${status} successfully`, {
        description: `The booking has been ${status}`,
      });

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
      await updateBookingStatus(
        bookingToReject._id,
        "rejected",
        "",
        rejectionReason
      );

      const currentBookings = Array.isArray(bookings) ? bookings : [];
      setBookings(
        currentBookings.map((booking) =>
          booking._id === bookingToReject._id
            ? { ...booking, status: "rejected", rejectionReason }
            : booking
        )
      );

      setIsRejectDialogOpen(false);
      setBookingToReject(null);
      setRejectionReason("");

      toast.success("Booking rejected successfully", {
        description: "Customer has been notified of the rejection",
      });

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

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      setIsUpdating(true);
      await updateBooking(editingBooking._id, editingBooking);

      const currentBookings = Array.isArray(bookings) ? bookings : [];
      setBookings(
        currentBookings.map((booking) =>
          booking._id === editingBooking._id ? editingBooking : booking
        )
      );

      setIsEditDialogOpen(false);
      setEditingBooking(null);

      toast.success("Booking updated successfully", {
        description:
          editingBooking.status === "rejected"
            ? "The booking has been rejected with the provided reason"
            : "The booking has been updated with your changes",
      });

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

  const toggleSection = (status) => {
    setExpandedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  // Filter and search bookings
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // Get today's date (start and end of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Filter bookings for today
  const todaysBookings = safeBookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === today.getTime();
  });

  // Filter today's completed bookings
  const todaysCompletedBookings = todaysBookings.filter(
    (booking) => booking.status === "completed"
  );

  // Apply search filter first
  const searchedBookings = safeBookings.filter((booking) => {
    if (searchQuery === "") return true;

    const searchLower = searchQuery.toLowerCase();
    const customerName = `${booking.user?.first_name || ""} ${
      booking.user?.last_name || ""
    }`.toLowerCase();

    // Check if services is an array or single service
    const serviceMatch = Array.isArray(booking.services)
      ? booking.services.some((service) => {
          // Handle both string services and service objects
          if (typeof service === 'string') {
            return service.toLowerCase().includes(searchLower);
          } else if (service && service.name) {
            return service.name.toLowerCase().includes(searchLower);
          }
          return false;
        })
      : booking.service?.toLowerCase().includes(searchLower);

    return (
      customerName.includes(searchLower) ||
      booking.user?.first_name?.toLowerCase().includes(searchLower) ||
      booking.user?.last_name?.toLowerCase().includes(searchLower) ||
      booking.user?.email?.toLowerCase().includes(searchLower) ||
      serviceMatch ||
      booking.vehicle?.toLowerCase().includes(searchLower) ||
      booking._id?.toLowerCase().includes(searchLower)
    );
  });

  // Apply status filter
  const statusFilteredBookings =
    filterStatus === "all"
      ? searchedBookings
      : searchedBookings.filter((booking) => booking.status === filterStatus);

  // Group bookings by status after filtering and limit to 50 per status
  const bookingsByStatus = {
    pending: statusFilteredBookings
      .filter((booking) => booking.status === "pending")
      .slice(0, 50),
    confirmed: statusFilteredBookings
      .filter((booking) => booking.status === "confirmed")
      .slice(0, 50),
    completed: statusFilteredBookings
      .filter((booking) => booking.status === "completed")
      .slice(0, 50),
    cancelled: statusFilteredBookings
      .filter((booking) => booking.status === "cancelled")
      .slice(0, 50),
    rejected: statusFilteredBookings
      .filter((booking) => booking.status === "rejected")
      .slice(0, 50),
    "no-show": statusFilteredBookings
      .filter((booking) => booking.status === "no-show")
      .slice(0, 50),
  };

  // Use the already filtered bookings grouped by status
  const filteredBookingsByStatus = bookingsByStatus;

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      "no-show": "bg-orange-100 text-orange-800 border-orange-200",
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      "no-show": <AlertCircle className="w-3 h-3" />,
    };

    return (
      <Badge
        variant="outline"
        className={`${variants[status]} border font-medium flex items-center gap-1.5 px-2.5 py-1`}
      >
        {icons[status]}
        <span className="capitalize text-xs">{status}</span>
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5 text-yellow-600" />,
      confirmed: <CheckCircle className="w-5 h-5 text-blue-600" />,
      completed: <CheckCircle className="w-5 h-5 text-green-600" />,
      cancelled: <XCircle className="w-5 h-5 text-gray-600" />,
      rejected: <XCircle className="w-5 h-5 text-red-600" />,
      "no-show": <AlertCircle className="w-5 h-5 text-orange-600" />,
    };

    return icons[status] || <Calendar className="w-5 h-5 text-gray-600" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-50",
      confirmed: "text-blue-600 bg-blue-50",
      completed: "text-green-600 bg-green-50",
      cancelled: "text-gray-600 bg-gray-50",
      rejected: "text-red-600 bg-red-50",
      "no-show": "text-orange-600 bg-orange-50",
    };

    return colors[status] || "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-white">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500/60" />
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
    );
  }

  if (error && safeBookings.length === 0) {
    return (
      <div className="flex h-screen w-full bg-white">
        <div className="w-full flex flex-col items-center justify-center">
          <Card className="border-red-200 bg-red-50 max-w-md">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Booking Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage customer bookings and appointments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={fetchBookings}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 hover:bg-blue-50"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh Data</span>
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Today's Bookings
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todaysBookings.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {safeBookings.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {bookingsByStatus.pending.length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Confirmed
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {bookingsByStatus.confirmed.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Completed Today
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {todaysCompletedBookings.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {bookingsByStatus.completed.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="border-0 shadow-sm bg-white mt-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by service, customer name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-semibold">
              Bookings by Status
            </CardTitle>
          </CardHeader>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6">
              {/* Pending Bookings Section */}
              {filteredBookingsByStatus.pending.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("pending")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${getStatusColor(
                          "pending"
                        )}`}
                      >
                        {getStatusIcon("pending")}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pending Bookings
                        </h3>
                        <p className="text-sm text-gray-500">
                          {filteredBookingsByStatus.pending.length} booking
                          {filteredBookingsByStatus.pending.length !== 1
                            ? "s"
                            : ""}{" "}
                          requiring approval
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedSections.pending ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {expandedSections.pending && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                      {filteredBookingsByStatus.pending.map((booking) => (
                        <BookingCard
                          key={booking._id}
                          booking={booking}
                          getStatusBadge={getStatusBadge}
                          handleEditBooking={handleEditBooking}
                          handleQuickReject={handleQuickReject}
                          handleStatusUpdate={handleStatusUpdate}
                          isUpdating={isUpdating}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Confirmed Bookings Section */}
              {filteredBookingsByStatus.confirmed.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("confirmed")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${getStatusColor(
                          "confirmed"
                        )}`}
                      >
                        {getStatusIcon("confirmed")}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Confirmed Bookings
                        </h3>
                        <p className="text-sm text-gray-500">
                          {filteredBookingsByStatus.confirmed.length} upcoming
                          booking
                          {filteredBookingsByStatus.confirmed.length !== 1
                            ? "s"
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedSections.confirmed ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {expandedSections.confirmed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                      {filteredBookingsByStatus.confirmed.map((booking) => (
                        <BookingCard
                          key={booking._id}
                          booking={booking}
                          getStatusBadge={getStatusBadge}
                          handleEditBooking={handleEditBooking}
                          handleQuickReject={handleQuickReject}
                          handleStatusUpdate={handleStatusUpdate}
                          isUpdating={isUpdating}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Completed Bookings Section */}
              {filteredBookingsByStatus.completed.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("completed")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${getStatusColor(
                          "completed"
                        )}`}
                      >
                        {getStatusIcon("completed")}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Completed Bookings
                        </h3>
                        <p className="text-sm text-gray-500">
                          {filteredBookingsByStatus.completed.length} finished
                          booking
                          {filteredBookingsByStatus.completed.length !== 1
                            ? "s"
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedSections.completed ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {expandedSections.completed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                      {filteredBookingsByStatus.completed.map((booking) => (
                        <BookingCard
                          key={booking._id}
                          booking={booking}
                          getStatusBadge={getStatusBadge}
                          handleEditBooking={handleEditBooking}
                          handleQuickReject={handleQuickReject}
                          handleStatusUpdate={handleStatusUpdate}
                          isUpdating={isUpdating}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Other Status Sections */}
              {["cancelled", "rejected", "no-show"].map(
                (status) =>
                  filteredBookingsByStatus[status].length > 0 && (
                    <div key={status} className="bg-gray-50 rounded-lg p-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection(status)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${getStatusColor(
                              status
                            )}`}
                          >
                            {getStatusIcon(status)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">
                              {status === "no-show" ? "No-Show" : status}{" "}
                              Bookings
                            </h3>
                            <p className="text-sm text-gray-500">
                              {filteredBookingsByStatus[status].length} booking
                              {filteredBookingsByStatus[status].length !== 1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {expandedSections[status] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {expandedSections[status] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                          {filteredBookingsByStatus[status].map((booking) => (
                            <BookingCard
                              key={booking._id}
                              booking={booking}
                              getStatusBadge={getStatusBadge}
                              handleEditBooking={handleEditBooking}
                              handleQuickReject={handleQuickReject}
                              handleStatusUpdate={handleStatusUpdate}
                              isUpdating={isUpdating}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
              )}

              {/* Empty State */}
              {Object.values(filteredBookingsByStatus).every(
                (arr) => arr.length === 0
              ) && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mb-4" />
                  <p className="text-lg font-medium">No Bookings Found</p>
                  <p className="text-sm">
                    No bookings match your current filters
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Edit Booking Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>
                Update booking details below. Changes will be saved immediately.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editingBooking?.date || ""}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    value={
                      editingBooking?.timeSlot || editingBooking?.time || ""
                    }
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        timeSlot: e.target.value,
                        time: e.target.value,
                      })
                    }
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Input
                  id="service"
                  value={editingBooking?.service || ""}
                  onChange={(e) =>
                    setEditingBooking({
                      ...editingBooking,
                      service: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Input
                  id="vehicle"
                  value={editingBooking?.vehicle || ""}
                  onChange={(e) =>
                    setEditingBooking({
                      ...editingBooking,
                      vehicle: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingBooking?.status || ""}
                  onValueChange={(value) =>
                    setEditingBooking({
                      ...editingBooking,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editingBooking?.notes || ""}
                  onChange={(e) =>
                    setEditingBooking({
                      ...editingBooking,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Optional notes about this booking..."
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reject Booking Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reject Booking</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this booking. The customer
                will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this booking is being rejected..."
                  rows={4}
                />
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
  );
};

// Booking Card Component for better organization
const BookingCard = ({
  booking,
  getStatusBadge,
  handleEditBooking,
  handleQuickReject,
  handleStatusUpdate,
  isUpdating,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {booking.user?.first_name && booking.user?.last_name
                ? `${booking.user.first_name} ${booking.user.last_name}`
                : "Customer"}
            </h3>
            <p className="text-sm text-gray-500">
              {booking.user?.email || "No email"}
            </p>
          </div>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <CalendarDays className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {new Date(booking.date).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{booking.timeSlot || booking.time}</span>
        </div>

        <div className="flex items-start gap-2 text-gray-700">
          <Car className="w-4 h-4 text-gray-500 mt-0.5" />
          <div className="text-sm">
            {booking.services && booking.services.length > 0 ? (
              <div>
                {booking.services.map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span>• {srv.name}</span>
                    <span className="text-xs text-gray-500">
                      ({srv.duration}h)
                    </span>
                  </div>
                ))}
                {booking.totalDuration && (
                  <div className="text-xs text-gray-500 mt-1 font-medium">
                    Total: {booking.totalDuration}h{" "}
                    {booking.endTime &&
                      `(${booking.timeSlot} - ${booking.endTime})`}
                  </div>
                )}
              </div>
            ) : (
              <span>{booking.service}</span>
            )}
          </div>
        </div>

        {booking.vehicle && (
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-sm font-medium">Vehicle:</span>
            <span className="text-sm">{booking.vehicle}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {booking.status === "pending" && (
          <>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(booking._id, "confirmed")}
              disabled={isUpdating}
              className="text-green-600 border-green-200 hover:bg-green-50 bg-green-50 flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Confirm
            </Button>
            <Button
              size="sm"
              onClick={() => handleQuickReject(booking)}
              disabled={isUpdating}
              className="text-red-600 border-red-200 hover:bg-red-50 bg-red-50 flex-1"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </>
        )}

        {booking.status === "confirmed" && (
          <>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(booking._id, "completed")}
              disabled={isUpdating}
              className="text-green-600 border-green-200 hover:bg-green-50 bg-green-50 flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(booking._id, "no-show")}
              disabled={isUpdating}
              className="text-orange-600 border-orange-200 hover:bg-orange-50 bg-orange-50 flex-1"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              No-Show
            </Button>
          </>
        )}
      </div>

      {/* Notes and Additional Info */}
      {(booking.notes ||
        booking.rejectionReason ||
        booking.cancellationReason) && (
        <div className="border-t border-gray-100 pt-3">
          {booking.notes && (
            <div className="bg-blue-50 p-3 rounded-lg mb-2">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Notes
                  </span>
                  <p className="text-sm text-blue-900 mt-1">{booking.notes}</p>
                </div>
              </div>
            </div>
          )}
          {booking.rejectionReason && (
            <div className="bg-red-50 p-3 rounded-lg mb-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-red-700 uppercase tracking-wide">
                    Rejection Reason
                  </span>
                  <p className="text-sm text-red-900 mt-1">
                    {booking.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}
          {booking.cancellationReason && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">
                    Cancellation Reason
                  </span>
                  <p className="text-sm text-orange-900 mt-1">
                    {booking.cancellationReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Menu */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {booking.updatedAt && (
            <>Updated: {new Date(booking.updatedAt).toLocaleDateString()}</>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            {booking.status === "pending" && (
              <DropdownMenuItem
                onClick={() => handleQuickReject(booking)}
                className="text-red-600"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject with Reason
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AdminBookings;
