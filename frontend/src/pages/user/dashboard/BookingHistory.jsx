import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
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
} from "lucide-react";

const BookingHistory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock booking data - replace with actual API call
  const bookings = [
    {
      id: 1,
      bookingNumber: "BK001",
      service: "Basic Wash",
      date: "2025-08-05",
      time: "10:00 AM",
      status: "completed",
      location: "Main Location",
    },
    {
      id: 2,
      bookingNumber: "BK002",
      service: "Premium Wash",
      date: "2025-08-03",
      time: "2:00 PM",
      status: "completed",
      location: "Main Location",
    },
    {
      id: 3,
      bookingNumber: "BK003",
      service: "Deluxe Detail",
      date: "2025-08-01",
      time: "9:00 AM",
      status: "cancelled",
      location: "Main Location",
    },
    {
      id: 4,
      bookingNumber: "BK004",
      service: "Basic Wash",
      date: "2025-07-28",
      time: "11:00 AM",
      status: "completed",
      location: "Main Location",
    },
    {
      id: 5,
      bookingNumber: "BK005",
      service: "Premium Wash",
      date: "2025-07-25",
      time: "3:00 PM",
      status: "no-show",
      location: "Main Location",
    },
    {
      id: 6,
      bookingNumber: "BK006",
      service: "Basic Wash",
      date: "2025-07-20",
      time: "1:00 PM",
      status: "completed",
      location: "Main Location",
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
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
    const matchesSearch = 
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Your Booking History
        </h1>
        <p className="text-gray-600">
          Track all your motorcycle wash appointments
        </p>
      </div>

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
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-2xl">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredBookings.map((booking, index) => (
                  <tr 
                    key={booking.id} 
                    className="hover:bg-red-50/30 transition-all duration-200 group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all duration-200">
                          {getStatusIcon(booking.status)}
                        </div>
                        <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-red-800 transition-colors duration-200">
                        {booking.bookingNumber}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.service}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="p-1 bg-blue-50 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="font-medium">
                          {new Date(booking.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="p-1 bg-green-50 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <span className="font-medium">{booking.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1 bg-orange-50 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <span className="font-medium">{booking.location}</span>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
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
    </div>
  );
};

export default BookingHistory;
