import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
  X,
} from "lucide-react";

const Bookings = () => {
  const { user, createBooking, getAvailableSlots } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState("motorcycle");
  const [notes, setNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  // Get user's full name or default to "User"
  const fullName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : "User";

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isPastDate = date < today && !isToday;
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPastDate,
        isSelected,
      });
    }

    return days;
  };

  const services = [
    {
      id: "UV Graphene Ceramic Coating",
      name: "UV Graphene Ceramic Coating",
      description: "Premium ceramic coating protection",
    },
    {
      id: "Powder Coating",
      name: "Powder Coating",
      description: "Durable powder coating finish",
    },
    {
      id: "Moto/Oto VIP",
      name: "Moto/Oto VIP",
      description: "VIP motorcycle treatment",
    },
    {
      id: "Full Moto/Oto SPA",
      name: "Full Moto/Oto SPA",
      description: "Complete spa treatment",
    },
    {
      id: "Modernized Interior Detailing",
      name: "Modernized Interior Detailing",
      description: "Interior detailing service",
    },
    {
      id: "Modernized Engine Detailing",
      name: "Modernized Engine Detailing",
      description: "Engine cleaning and detailing",
    },
  ];

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Helper function to format date without timezone issues
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    try {
      const dateString = formatDateForAPI(selectedDate);
      const slots = await getAvailableSlots(dateString);

      setAvailableSlots(slots);
      setSelectedTimeSlot(null); // Reset selected time slot

      if (slots.length === 0) {
        toast.info("No slots available", {
          description:
            "All time slots are booked for this date. Please try another date.",
        });
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots([]);
      setError(
        "Failed to load time slots. Please try refreshing or selecting a different date."
      );
      toast.error("Failed to load time slots", {
        description: "Please try refreshing or selecting a different date.",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedService) return;

    // Check if user is authenticated before attempting booking
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      toast.error("Authentication Required", {
        description: "Please log in again to continue.",
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    // Verify user object is available
    if (!user) {
      toast.error("User Session Error", {
        description: "Please log in again to continue.",
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        service: selectedService.id,
        date: formatDateForAPI(selectedDate),
        timeSlot: selectedTimeSlot.time,
        vehicle: selectedVehicle,
        notes: notes.trim(),
      };

      console.log("Creating booking with data:", bookingData);
      await createBooking(bookingData);
      setBookingSuccess(true);

      toast.success("Booking confirmed!", {
        description: `Your ${
          selectedService.name
        } appointment on ${selectedDate.toLocaleDateString()} at ${
          selectedTimeSlot.time
        } has been booked.`,
        action: {
          label: "View History",
          onClick: () => (window.location.href = "/dashboard/booking-history"),
        },
      });

      // Reset form and close dialog after successful booking
      setTimeout(() => {
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        setSelectedService(null);
        setSelectedVehicle("motorcycle");
        setNotes("");
        setBookingSuccess(false);
        setIsDialogOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Booking failed:", error);

      // Handle specific error cases
      if (error.message.includes("verify your email")) {
        toast.error("Email Verification Required", {
          description: error.message,
          action: {
            label: "Verify Now",
            onClick: () =>
              navigate("/verify-email", {
                state: { email: user.email, source: "booking" },
              }),
          },
        });
      } else if (
        error.message.includes("session has expired") ||
        error.message.includes("Authentication failed")
      ) {
        toast.error("Session Expired", {
          description: "Please log in again to continue.",
          action: {
            label: "Login",
            onClick: () => navigate("/login"),
          },
        });
      } else if (error.message.includes("Admin users cannot")) {
        toast.error("Access Denied", {
          description:
            "Admin users cannot create bookings. Please use a customer account.",
        });
      } else {
        toast.error("Booking failed", {
          description:
            error.message ||
            error.response?.data?.message ||
            "Please try again or contact support if the problem persists.",
        });
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateSelect = (day) => {
    if (day.isPastDate || !day.isCurrentMonth) return;
    setSelectedDate(day.date);
    setError(""); // Clear any existing errors
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setError(""); // Clear any existing errors
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Compact Header */}
      <div className="w-full flex flex-col h-full">
        <div className="bg-white px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            Book Your Service, <span className="text-red-600">{fullName}</span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Select service, date, and time to complete your booking
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-4 pt-4">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <X className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            {/* Services Section */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-red-600" />
                    Select Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {services.map((service, index) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedService?.id === service.id
                            ? "border-red-500 bg-red-50 shadow-sm"
                            : "border-gray-200 hover:border-red-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium text-sm ${
                                selectedService?.id === service.id
                                  ? "text-red-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {service.name}
                            </h3>
                            <p
                              className={`text-xs mt-1 ${
                                selectedService?.id === service.id
                                  ? "text-red-700"
                                  : "text-gray-600"
                              }`}
                            >
                              {service.description}
                            </p>
                          </div>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedService?.id === service.id
                                ? "bg-red-500 text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {selectedService?.id === service.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-semibold">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar & Time Selection */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Calendar */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth(-1)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h3 className="font-medium text-gray-900">
                        {monthNames[currentMonth.getMonth()]}{" "}
                        {currentMonth.getFullYear()}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth(1)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <div
                          key={`day-header-${index}`}
                          className="p-2 text-center text-xs font-medium text-gray-500"
                        >
                          {day}
                        </div>
                      ))}
                      {calendarDays.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day)}
                          disabled={day.isPastDate || !day.isCurrentMonth}
                          className={`p-2 text-sm rounded-lg transition-all duration-200 h-10 border ${
                            day.isCurrentMonth
                              ? day.isPastDate
                                ? "text-gray-300 cursor-not-allowed border-transparent bg-gray-50"
                                : day.isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm font-medium"
                                : day.isToday
                                ? "bg-blue-50 text-blue-600 border-blue-200 font-medium hover:bg-blue-100 hover:border-blue-300"
                                : "text-gray-700 border-transparent hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                              : "text-gray-200 cursor-not-allowed border-transparent bg-gray-50"
                          }`}
                        >
                          {day.day}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Time Slots */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      Available Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {!selectedDate ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">
                          Select a date to view available times
                        </p>
                      </div>
                    ) : loadingSlots ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="h-12 bg-gray-100 rounded-md animate-pulse"
                          />
                        ))}
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <X className="w-12 h-12 text-red-300 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">
                          No available slots for this date
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Try selecting another date
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-3 rounded-md border-2 transition-all duration-200 text-sm font-medium ${
                              selectedTimeSlot?.time === slot.time
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700"
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col h-full">
                  <div className="space-y-3 flex-1">
                    {/* Service Summary */}
                    <div
                      className={`p-3 rounded-lg border ${
                        selectedService
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            selectedService ? "bg-red-500" : "bg-gray-300"
                          }`}
                        >
                          <Sparkles
                            className={`w-4 h-4 ${
                              selectedService ? "text-white" : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Service
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {selectedService
                              ? selectedService.name
                              : "No service selected"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date Summary */}
                    <div
                      className={`p-3 rounded-lg border ${
                        selectedDate
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            selectedDate ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          <Calendar
                            className={`w-4 h-4 ${
                              selectedDate ? "text-white" : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Date
                          </p>
                          <p className="text-xs text-gray-600">
                            {selectedDate
                              ? selectedDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "No date selected"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Time Summary */}
                    <div
                      className={`p-3 rounded-lg border ${
                        selectedTimeSlot
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            selectedTimeSlot ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <Clock
                            className={`w-4 h-4 ${
                              selectedTimeSlot ? "text-white" : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Time
                          </p>
                          <p className="text-xs text-gray-600">
                            {selectedTimeSlot
                              ? selectedTimeSlot.time
                              : "No time selected"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="pt-3">
                      <div className="mb-2">
                        <Progress
                          value={
                            !selectedService
                              ? 0
                              : !selectedDate
                              ? 33
                              : !selectedTimeSlot
                              ? 66
                              : 100
                          }
                          className="h-2"
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        {!selectedService
                          ? "Choose a service to start"
                          : !selectedDate
                          ? "Select your preferred date"
                          : !selectedTimeSlot
                          ? "Pick an available time"
                          : "Ready to book!"}
                      </p>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="pt-4 mt-auto">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={
                            !selectedDate ||
                            !selectedTimeSlot ||
                            !selectedService
                          }
                          className={`w-full ${
                            selectedDate && selectedTimeSlot && selectedService
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                          size="lg"
                        >
                          {selectedDate && selectedTimeSlot && selectedService
                            ? "Book Appointment"
                            : "Complete Your Selection"}
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-md mx-4 rounded-lg">
                        <DialogHeader className="text-center pb-4">
                          <DialogTitle className="text-xl font-semibold text-gray-900">
                            Confirm Your Booking
                          </DialogTitle>
                          <DialogDescription className="text-gray-600 text-sm">
                            Review your booking details and confirm
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* Booking Details */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">
                                Service
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {selectedService?.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">
                                Date
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {selectedDate?.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">
                                Time
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {selectedTimeSlot?.time}
                              </span>
                            </div>
                          </div>

                          {/* Vehicle Selection */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Vehicle Type
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setSelectedVehicle("motorcycle")}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                  selectedVehicle === "motorcycle"
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                                }`}
                              >
                                🏍️ Motorcycle
                              </button>
                              <button
                                onClick={() => setSelectedVehicle("automobile")}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                  selectedVehicle === "automobile"
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                                }`}
                              >
                                🚗 Automobile
                              </button>
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Additional Notes (Optional)
                            </Label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Any special instructions..."
                              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-sm"
                              rows={3}
                              maxLength={500}
                            />
                            <div className="text-xs text-gray-400 text-right mt-1">
                              {notes.length}/500
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleBooking}
                            disabled={bookingLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                          >
                            {bookingLoading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Booking...
                              </div>
                            ) : bookingSuccess ? (
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Confirmed!
                              </div>
                            ) : (
                              "Confirm Booking"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
