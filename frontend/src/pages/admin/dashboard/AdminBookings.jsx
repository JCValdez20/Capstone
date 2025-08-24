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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import adminService from "@/services/adminService";

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

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings...");
      const response = await adminService.getAllBookings();
      console.log("Raw API Response:", response);

      // Ensure we always set an array
      let bookingsData = [];

      // The API returns { bookings: [...], pagination: {...} }
      if (response && response.bookings && Array.isArray(response.bookings)) {
        bookingsData = response.bookings;
        console.log("Using response.bookings:", bookingsData);
      } else if (
        response &&
        response.data &&
        response.data.bookings &&
        Array.isArray(response.data.bookings)
      ) {
        bookingsData = response.data.bookings;
        console.log("Using response.data.bookings:", bookingsData);
      } else if (response && response.data && Array.isArray(response.data)) {
        bookingsData = response.data;
        console.log("Using response.data:", bookingsData);
      } else if (response && Array.isArray(response)) {
        bookingsData = response;
        console.log("Using response directly:", bookingsData);
      } else {
        console.warn("Unexpected response format:", response);
        console.warn("Response type:", typeof response);
        if (response && typeof response === "object") {
          console.warn("Response keys:", Object.keys(response));
        }
      }

      console.log("Final processed bookings data:", bookingsData);
      console.log("Bookings array length:", bookingsData.length);
      setBookings(bookingsData);
      setError("");
    } catch (err) {
      console.error("Error fetching bookings:", err);
      console.error("Error details:", err.response?.data || err.message);
      setError("Failed to load bookings. Please try again.");
      setBookings([]); // Ensure we always have an array
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId, status, notes = "") => {
    try {
      setIsUpdating(true);
      await adminService.updateBookingStatus(bookingId, status, notes);

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
      await adminService.updateBookingStatus(
        bookingToReject._id,
        "rejected",
        "", // notes - empty for rejection
        rejectionReason // pass rejection reason as 4th parameter
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
      await adminService.updateBooking(editingBooking._id, editingBooking);

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

  // Filter and search bookings
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const filteredBookings = safeBookings.filter((booking) => {
    const matchesStatus =
      filterStatus === "all" || booking.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      booking.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.first_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.user?.last_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicle?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const pendingCount = safeBookings.filter(
    (b) => b.status === "pending"
  ).length;
  const confirmedCount = safeBookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const completedCount = safeBookings.filter(
    (b) => b.status === "completed"
  ).length;

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

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-white">
        <div className="w-full flex flex-col items-center justify-center">
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
    <div className="flex h-screen w-full bg-white">
      <div className="w-full flex flex-col h-full">
        {/* Header Section - Fixed */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="p-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {safeBookings.length}
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
                      <p className="text-sm font-medium text-gray-600">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {pendingCount}
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
                        {confirmedCount}
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
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {completedCount}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Search and Filter */}
                <Card className="border-0 shadow-sm bg-white">
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
                        <Select
                          value={filterStatus}
                          onValueChange={setFilterStatus}
                        >
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

                {/* Bookings List */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-semibold">
                      Bookings ({filteredBookings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredBookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Calendar className="w-12 h-12 mb-4" />
                        <p className="text-lg font-medium">No Bookings Found</p>
                        <p className="text-sm">
                          No bookings match your current filters
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px]">
                        <div className="divide-y divide-gray-100">
                          {filteredBookings.map((booking) => (
                            <div
                              key={booking._id}
                              className="p-4 lg:p-6 hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                {/* Customer Info */}
                                <div className="lg:col-span-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-gray-900 truncate">
                                        {booking.user?.first_name &&
                                        booking.user?.last_name
                                          ? `${booking.user.first_name} ${booking.user.last_name}`
                                          : "Customer"}
                                      </p>
                                      <p className="text-sm text-gray-500 truncate">
                                        {booking.user?.email || "No email"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Booking Details */}
                                <div className="lg:col-span-4">
                                  <div className="space-y-1">
                                    <p className="font-medium text-gray-900">
                                      {booking.service}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {booking.vehicle || "Motorcycle"}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {new Date(
                                          booking.date
                                        ).toLocaleDateString()}
                                      </span>
                                      <Clock className="w-4 h-4 ml-2" />
                                      <span>
                                        {booking.timeSlot || booking.time}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Status */}
                                <div className="lg:col-span-2 flex items-center">
                                  {getStatusBadge(booking.status)}
                                </div>

                                {/* Actions */}
                                <div className="lg:col-span-3 flex items-center justify-end gap-2">
                                  {booking.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            booking._id,
                                            "confirmed"
                                          )
                                        }
                                        disabled={isUpdating}
                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline ml-1">
                                          Confirm
                                        </span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleQuickReject(booking)
                                        }
                                        disabled={isUpdating}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline ml-1">
                                          Reject
                                        </span>
                                      </Button>
                                    </>
                                  )}

                                  {booking.status === "confirmed" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            booking._id,
                                            "completed"
                                          )
                                        }
                                        disabled={isUpdating}
                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline ml-1">
                                          Complete
                                        </span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            booking._id,
                                            "no-show"
                                          )
                                        }
                                        disabled={isUpdating}
                                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                      >
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline ml-1">
                                          No-Show
                                        </span>
                                      </Button>
                                    </>
                                  )}

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleEditBooking(booking)
                                        }
                                      >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit Details
                                      </DropdownMenuItem>
                                      {booking.status === "pending" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleQuickReject(booking)
                                          }
                                          className="text-red-600"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Reject with Reason
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                {/* Notes and Additional Info */}
                                {(booking.notes ||
                                  booking.rejectionReason ||
                                  booking.updatedBy) && (
                                  <div className="lg:col-span-full mt-3 pt-3 border-t border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {booking.notes && (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                          <div className="flex items-start gap-2">
                                            <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                                                Notes
                                              </span>
                                              <p className="text-sm text-blue-900 mt-1 leading-relaxed">
                                                {booking.notes}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {booking.rejectionReason && (
                                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                          <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                              <span className="text-xs font-medium text-red-700 uppercase tracking-wide">
                                                Rejection Reason
                                              </span>
                                              <p className="text-sm text-red-900 mt-1 leading-relaxed">
                                                {booking.rejectionReason}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Last Updated Info */}
                                    {booking.updatedBy && (
                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <User className="w-3 h-3" />
                                          <span>
                                            Last updated by{" "}
                                            {booking.updatedBy.first_name}{" "}
                                            {booking.updatedBy.last_name}(
                                            {booking.updatedBy.roles === "admin"
                                              ? "Administrator"
                                              : "Staff"}
                                            )
                                            {booking.updatedAt && (
                                              <>
                                                {" "}
                                                on{" "}
                                                {new Date(
                                                  booking.updatedAt
                                                ).toLocaleDateString()}{" "}
                                                at{" "}
                                                {new Date(
                                                  booking.updatedAt
                                                ).toLocaleTimeString()}
                                              </>
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Edit Booking Dialog */}
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                    <DialogDescription>
                      Update booking details below. Changes will be saved
                      immediately.
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
                            editingBooking?.timeSlot ||
                            editingBooking?.time ||
                            ""
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
              <Dialog
                open={isRejectDialogOpen}
                onOpenChange={setIsRejectDialogOpen}
              >
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Reject Booking</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this booking. The
                      customer will be notified.
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
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
