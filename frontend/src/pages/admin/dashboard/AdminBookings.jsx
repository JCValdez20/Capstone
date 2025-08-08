import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock booking data - replace with actual API calls
  const mockBookings = [
    {
      id: 1,
      customer: 'John Doe',
      email: 'john@example.com',
      service: 'Premium Wash',
      date: '2025-01-15',
      time: '10:00',
      duration: '1.5 hours',
      price: 450,
      status: 'pending',
      motorcycle: 'Honda CBR 600RR',
      notes: 'Please focus on the chain area'
    },
    {
      id: 2,
      customer: 'Jane Smith',
      email: 'jane@example.com',
      service: 'Basic Wash',
      date: '2025-01-15',
      time: '14:00',
      duration: '1 hour',
      price: 250,
      status: 'confirmed',
      motorcycle: 'Yamaha R6',
      notes: ''
    },
    {
      id: 3,
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      service: 'Full Detailing',
      date: '2025-01-16',
      time: '09:00',
      duration: '3 hours',
      price: 800,
      status: 'pending',
      motorcycle: 'Kawasaki Ninja 250',
      notes: 'First time customer'
    },
    {
      id: 4,
      customer: 'Sarah Wilson',
      email: 'sarah@example.com',
      service: 'Engine Clean',
      date: '2025-01-16',
      time: '11:30',
      duration: '2 hours',
      price: 600,
      status: 'confirmed',
      motorcycle: 'Suzuki GSX-R 750',
      notes: 'Regular customer'
    },
    {
      id: 5,
      customer: 'Tom Brown',
      email: 'tom@example.com',
      service: 'Wax & Polish',
      date: '2025-01-17',
      time: '15:00',
      duration: '2 hours',
      price: 500,
      status: 'rejected',
      motorcycle: 'Ducati Panigale V4',
      notes: 'Requested specific wax brand'
    },
  ];

  useEffect(() => {
    // Simulate API call
    setBookings(mockBookings);
  }, []);

  const handleApprove = (bookingId) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'confirmed' }
        : booking
    ));
  };

  const handleReject = (bookingId) => {
    if (confirm('Are you sure you want to reject this booking?')) {
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'rejected' }
          : booking
      ));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'border-orange-200 text-orange-800 bg-orange-50';
      case 'confirmed': return 'border-green-200 text-green-800 bg-green-50';
      case 'rejected': return 'border-red-200 text-red-800 bg-red-50';
      default: return 'border-gray-200 text-gray-800 bg-gray-50';
    }
  };

  // Group bookings by date for calendar-like display
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    const date = booking.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

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
                  <h1 className="text-4xl font-bold text-gray-900">Booking Management</h1>
                  <p className="text-lg text-gray-600 mt-2">Review and approve customer bookings</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-gray-500">Total: {bookings.length} bookings</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600 font-medium">Live Updates</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendar View
                </Button>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Report
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-blue-900">Total Bookings</CardTitle>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-blue-900 mb-2">{bookings.length}</div>
                <p className="text-sm text-blue-700">All time bookings</p>
                <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-orange-900">Pending Approval</CardTitle>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-orange-900 mb-2">{pendingCount}</div>
                <p className="text-sm text-orange-700">Require attention</p>
                <div className="mt-4 w-full bg-orange-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: `${bookings.length > 0 ? (pendingCount / bookings.length) * 100 : 0}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-green-900">Confirmed</CardTitle>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-green-900 mb-2">{confirmedCount}</div>
                <p className="text-sm text-green-700">Ready to serve</p>
                <div className="mt-4 w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: `${bookings.length > 0 ? (confirmedCount / bookings.length) * 100 : 0}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-purple-900">Revenue</CardTitle>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <div className="text-white font-bold">₱</div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-purple-900 mb-2">
                  ₱{bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.price, 0).toLocaleString()}
                </div>
                <p className="text-sm text-purple-700">From confirmed bookings</p>
                <div className="mt-4 w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filter Bar with Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <Card className="xl:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Filter Bookings</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">Filter by status or search specific bookings</CardDescription>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-xl">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 font-medium">{Object.keys(bookingsByDate).length} booking days</span>
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
                    <option value="rejected">Rejected</option>
                  </select>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-300 hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Advanced Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{pendingCount}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Confirmed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{confirmedCount}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Rejected</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{rejectedCount}</span>
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 mt-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Today's Schedule
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Calendar-Style Booking Display */}
          <div className="space-y-6">
            {Object.entries(bookingsByDate).sort().map(([date, dateBookings]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <span>{new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <Badge variant="outline" className="ml-auto">
                      {dateBookings.length} booking{dateBookings.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dateBookings.sort((a, b) => a.time.localeCompare(b.time)).map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-lg">{booking.time}</span>
                                <span className="text-sm text-gray-500">({booking.duration})</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`flex items-center space-x-1 ${getStatusColor(booking.status)}`}
                              >
                                {getStatusIcon(booking.status)}
                                <span className="capitalize">{booking.status}</span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{booking.customer}</p>
                                    <p className="text-sm text-gray-500">{booking.email}</p>
                                  </div>
                                </div>
                                <div className="ml-6">
                                  <p className="text-sm"><strong>Service:</strong> {booking.service}</p>
                                  <p className="text-sm"><strong>Motorcycle:</strong> {booking.motorcycle}</p>
                                  <p className="text-sm"><strong>Price:</strong> ₱{booking.price}</p>
                                </div>
                              </div>
                              
                              {booking.notes && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <p className="text-sm font-medium text-gray-700">Customer Notes:</p>
                                  <p className="text-sm text-gray-600">{booking.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {booking.status === 'pending' && (
                            <div className="flex space-x-2 ml-4">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleApprove(booking.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReject(booking.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {Object.keys(bookingsByDate).length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No bookings found</p>
                  <p className="text-gray-400 text-sm">Bookings will appear here when customers make reservations</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminBookings;