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
import { bookingService } from "../../../services/bookingService";
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
  const { user } = useAuth();
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
      const slots = await bookingService.getAvailableSlots(dateString);

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
      setError("Failed to load time slots. Please try refreshing or selecting a different date.");
      toast.error("Failed to load time slots", {
        description: "Please try refreshing or selecting a different date.",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedService) return;

    setBookingLoading(true);
    try {
      const bookingData = {
        service: selectedService.id,
        date: formatDateForAPI(selectedDate),
        timeSlot: selectedTimeSlot.time,
        vehicle: selectedVehicle,
        notes: notes.trim(),
      };

      await bookingService.createBooking(bookingData);
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
      } else if (error.message.includes("session has expired")) {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="w-full">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Welcome back,{" "}
            <span className="text-red-600 font-medium">{fullName}</span>
          </h1>
          <p className="text-gray-600">
            Choose your perfect motorcycle care service
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 py-6 h-[calc(100vh-140px)]">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-xl border-red-200 bg-red-50">
            <X className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-12 h-full max-w-none">
          {/* Services Section - Featured prominently */}
          <div className="xl:col-span-1 lg:col-span-1 col-span-1">
            <div className="bg-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200 h-full flex flex-col">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-3">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Our Premium Services
                </h2>
                <p className="text-sm text-gray-600">
                  Premium motorcycle care tailored to your needs
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto scrollbar-hide">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className={`
                      group relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-300
                      ${
                        selectedService?.id === service.id
                          ? "border-red-500 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-[1.02] transform"
                          : "border-gray-200 bg-white hover:border-red-200 hover:shadow-md hover:scale-[1.01] transform"
                      }
                    `}
                  >
                    <div className="p-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-2">
                          <h3
                            className={`font-semibold text-sm leading-tight ${
                              selectedService?.id === service.id
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {service.name}
                          </h3>
                          <p
                            className={`text-xs ${
                              selectedService?.id === service.id
                                ? "text-red-100"
                                : "text-gray-600"
                            }`}
                          >
                            {service.description}
                          </p>
                        </div>
                        <div
                          className={`
                          w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0
                          ${
                            selectedService?.id === service.id
                              ? "bg-white text-red-500"
                              : "bg-gray-100 text-gray-400 group-hover:bg-red-50 group-hover:text-red-500"
                          }
                        `}
                        >
                          {selectedService?.id === service.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Animated background effect */}
                    {selectedService?.id === service.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-700 opacity-20 animate-pulse"></div>
                    )}

                    {/* Number indicator */}
                    <div
                      className={`
                      absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${
                        selectedService?.id === service.id
                          ? "bg-white text-red-500"
                          : "bg-red-50 text-red-500"
                      }
                    `}
                    >
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="xl:col-span-1 lg:col-span-1 col-span-1 h-full">
            <div className="space-y-4 h-full flex flex-col">
              {/* Calendar */}
              <div className="bg-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  Select Date
                </h2>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth(-1)}
                    className="p-3 hover:bg-gray-200 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="font-semibold text-base text-gray-900">
                    {monthNames[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth(1)}
                    className="p-3 hover:bg-gray-200 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <div
                      key={`day-header-${index}`}
                      className="p-3 text-center text-sm font-semibold text-gray-600"
                    >
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day)}
                      disabled={day.isPastDate || !day.isCurrentMonth}
                      className={`
                        p-3 text-sm rounded-lg transition-all duration-200 relative font-medium min-h-[44px]
                        ${
                          day.isCurrentMonth
                            ? day.isPastDate
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-800 hover:bg-blue-50 hover:scale-105"
                            : "text-gray-200"
                        }
                        ${
                          day.isToday
                            ? "bg-blue-50 text-blue-600 font-bold ring-2 ring-blue-200"
                            : ""
                        }
                        ${
                          day.isSelected
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg scale-110"
                            : ""
                        }
                      `}
                    >
                      {day.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200 flex-1 min-h-0">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  Available Times
                </h2>

                <div className="h-[calc(100%-80px)] overflow-y-auto scrollbar-hide">{!selectedDate && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">
                      Select a date first
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Choose your preferred date to see available time slots
                    </p>
                  </div>
                )}

                {selectedDate && loadingSlots && (
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-gray-200 animate-pulse bg-white"
                      >
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDate && !loadingSlots && (
                  <div>
                    {availableSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <X className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-gray-600 font-medium text-sm">
                          No slots available
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Try a different date or contact us directly
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`
                              p-4 rounded-lg border-2 transition-all duration-300 text-center group min-h-[60px]
                              ${
                                selectedTimeSlot?.time === slot.time
                                  ? "border-green-500 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md scale-105"
                                  : "border-gray-200 hover:border-green-300 hover:bg-green-50 bg-white"
                              }
                            `}
                          >
                            <div
                              className={`font-bold text-base ${
                                selectedTimeSlot?.time === slot.time
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {slot.time}
                            </div>
                            <div
                              className={`text-sm mt-1 ${
                                selectedTimeSlot?.time === slot.time
                                  ? "text-green-100"
                                  : "text-gray-500"
                              }`}
                            >
                              Available
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary & CTA */}
          <div className="xl:col-span-1 lg:col-span-1 col-span-1">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-6 border border-gray-200 h-full flex flex-col">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-3">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Booking Summary
                </h2>
                <p className="text-gray-600 text-sm">Review your selection</p>
              </div>

              <div className="space-y-4 mb-6 flex-1 min-h-0">
                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedService
                      ? "border-red-200 bg-red-50 shadow-sm"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedService ? "bg-red-500" : "bg-gray-300"
                    }`}>
                      <Sparkles
                        className={`w-5 h-5 ${
                          selectedService ? "text-white" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">Service</p>
                      <p className="text-sm text-gray-600 mt-1 leading-tight truncate">
                        {selectedService
                          ? selectedService.name
                          : "Choose your service"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedDate
                      ? "border-blue-200 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedDate ? "bg-blue-500" : "bg-gray-300"
                    }`}>
                      <Calendar
                        className={`w-5 h-5 ${
                          selectedDate ? "text-white" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">Date</p>
                      <p className="text-sm text-gray-600 mt-1 leading-tight">
                        {selectedDate
                          ? selectedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Select your date"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedTimeSlot
                      ? "border-green-200 bg-green-50 shadow-sm"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedTimeSlot ? "bg-green-500" : "bg-gray-300"
                    }`}>
                      <Clock
                        className={`w-5 h-5 ${
                          selectedTimeSlot ? "text-white" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">Time</p>
                      <p className="text-sm text-gray-600 mt-1 leading-tight">
                        {selectedTimeSlot
                          ? selectedTimeSlot.time
                          : "Choose your time"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Progress Indicator */}
              <div className="mb-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Booking Progress
                  </p>
                  
                  {/* Shadcn Progress Bar */}
                  <div className="mb-3">
                    <Progress 
                      value={
                        !selectedService ? 0 :
                        !selectedDate ? 33 :
                        !selectedTimeSlot ? 66 : 100
                      } 
                      className="w-full h-2"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    {!selectedService ? "Step 1: Choose Service" :
                     !selectedDate ? "Step 2: Select Date" :
                     !selectedTimeSlot ? "Step 3: Pick Time" : "Ready to Book!"}
                  </p>
                </div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={
                      !selectedDate || !selectedTimeSlot || !selectedService
                    }
                    className={`
                      w-full py-4 text-base font-bold rounded-xl transition-all duration-300 transform
                      ${
                        selectedDate && selectedTimeSlot && selectedService
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }
                    `}
                  >
                    {selectedDate && selectedTimeSlot && selectedService ? (
                      "Book My Service"
                    ) : (
                      "Complete Selection Above"
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg mx-4 rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader className="text-center space-y-2 pb-4 shrink-0">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-red-800 to-red-900 rounded-full flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      Confirm Your Booking
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm">
                      Please review your booking details before confirming
                    </DialogDescription>
                  </DialogHeader>

                  <div
                    className="flex-1 overflow-auto space-y-4 px-1"
                    style={{ maxHeight: "calc(90vh - 200px)" }}
                  >
                    {/* Booking Summary Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-red-800" />
                        Booking Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700 font-medium text-sm">
                              Date
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {selectedDate
                              ? selectedDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Not selected"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-gray-700 font-medium text-sm">
                              Time
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {selectedTimeSlot
                              ? selectedTimeSlot.time
                              : "Not selected"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-gray-700 font-medium text-sm">
                              Service
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {selectedService
                              ? selectedService.name
                              : "Not selected"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Selection */}
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4 text-red-800" />
                        Vehicle Type
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedVehicle("motorcycle")}
                          className={`p-2 rounded-lg border transition-all duration-200 text-sm ${
                            selectedVehicle === "motorcycle"
                              ? "border-red-800 bg-red-50 text-red-800"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="font-medium">🏍️ Motorcycle</div>
                        </button>
                        <button
                          onClick={() => setSelectedVehicle("automobile")}
                          className={`p-2 rounded-lg border transition-all duration-200 text-sm ${
                            selectedVehicle === "automobile"
                              ? "border-red-800 bg-red-50 text-red-800"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="font-medium">🚗 Automobile</div>
                        </button>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Additional Notes
                      </h4>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any special instructions or notes..."
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-800/20 focus:border-red-800 resize-none text-sm"
                        rows={2}
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {notes.length}/500 characters
                      </div>
                    </div>
                  </div>

                  {/* Fixed Buttons at Bottom */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 py-2 text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBooking}
                      disabled={bookingLoading}
                      className="flex-1 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {bookingLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating Booking...
                        </div>
                      ) : bookingSuccess ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Booking Confirmed!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Confirm Booking
                        </div>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
