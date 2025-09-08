import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  Loader2,
  MessageCircle,
} from "lucide-react";

const BookingHistory = () => {
  const { getUserBookings, cancelBooking } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserBookings();
      setBookings(response.data || response || []); // Handle both response formats
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load booking history");
      toast.error("Failed to load bookings", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [getUserBookings]);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      // Refresh bookings after cancellation
      fetchBookings();
      toast.success("Booking cancelled", {
        description:
          "Your booking has been successfully cancelled and the time slot is now available.",
      });
    } catch (err) {
      console.error("Error canceling booking:", err);
      toast.error("Failed to cancel booking", {
        description:
          err.response?.data?.message || "Please try again or contact support.",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "no-show":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "no-show":
        return "No Show";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "no-show":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      booking._id?.toLowerCase().includes(searchLower) ||
      booking.service?.toLowerCase().includes(searchLower) ||
      booking.status?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Booking History
        </h1>
        <p className="text-gray-600">
          Track all your motorcycle wash appointments
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 overflow-hidden px-8 py-4">
          <SkeletonTable rows={8} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Filters */}
          <div className="px-8 py-6 bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
            <div className="flex items-center gap-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition-all duration-200 text-sm placeholder-gray-400"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition-all duration-200 text-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="bg-white/80 backdrop-blur-sm mx-8 my-4 rounded-2xl border border-gray-200/50 shadow-lg shadow-red-800/5">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-2xl">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Booking #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-2xl">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-red-50/30 transition-all duration-200 group"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all duration-200">
                              {getStatusIcon(booking.status)}
                            </div>
                            <span
                              className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusText(booking.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-red-800 transition-colors duration-200">
                            #{booking._id?.slice(-6) || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {booking.service}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                              booking.vehicle === "motorcycle"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {booking.vehicle === "motorcycle" ? "🏍️" : "🚗"}
                            {booking.vehicle === "motorcycle"
                              ? "Motorcycle"
                              : "Automobile"}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="p-1 bg-blue-50 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="font-medium">
                              {new Date(booking.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="p-1 bg-green-50 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <span className="font-medium">
                              {booking.timeSlot}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="max-w-xs">
                            {booking.notes ? (
                              <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border">
                                <div className="truncate" title={booking.notes}>
                                  {booking.notes.length > 50
                                    ? `${booking.notes.substring(0, 50)}...`
                                    : booking.notes}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 italic">
                                No notes
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Message Button */}

                            {/* Cancel Button */}
                            {(booking.status === "pending" ||
                              booking.status === "confirmed") && (
                              <button
                                onClick={() => {
                                  toast("Cancel booking?", {
                                    description:
                                      "Are you sure you want to cancel this booking?",
                                    action: {
                                      label: "Cancel Booking",
                                      onClick: () =>
                                        handleCancelBooking(booking._id),
                                    },
                                  });
                                }}
                                className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredBookings.length === 0 && (
                  <div className="text-center py-16 px-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No bookings found
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search criteria or filter settings to find what you're looking for."
                        : "You haven't made any bookings yet. Start by scheduling your first motorcycle wash!"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingHistory;
