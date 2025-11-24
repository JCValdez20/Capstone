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
  const { user, createBooking, getAvailableSlots, validateServices } =
    useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("motorcycle");
  const [notes, setNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [serviceValidation, setServiceValidation] = useState(null);
  const [loadingValidation, setLoadingValidation] = useState(false);

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
      duration: 4,
      category: "coating",
    },
    {
      id: "Powder Coating",
      name: "Powder Coating",
      description: "Durable powder coating finish",
      duration: 2,
      category: "coating",
    },
    {
      id: "Moto/Oto VIP",
      name: "Moto/Oto VIP",
      description: "VIP motorcycle treatment",
      duration: 3,
      category: "package",
    },
    {
      id: "Full Moto/Oto SPA",
      name: "Full Moto/Oto SPA",
      description: "Complete spa treatment",
      duration: 4,
      category: "package",
    },
    {
      id: "Modernized Interior Detailing",
      name: "Modernized Interior Detailing",
      description: "Interior detailing service",
      duration: 2,
      category: "detailing",
    },
    {
      id: "Modernized Engine Detailing",
      name: "Modernized Engine Detailing",
      description: "Engine cleaning and detailing",
      duration: 1,
      category: "detailing",
    },
  ];

  // Validate service combination when services change
  useEffect(() => {
    if (selectedServices.length > 0) {
      validateServiceCombination();
    } else {
      setServiceValidation(null);
      setAvailableSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServices]);

  // Fetch available slots when date or validated services change
  useEffect(() => {
    if (selectedDate && serviceValidation?.valid) {
      fetchAvailableSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, serviceValidation]);

  // Helper function to format date without timezone issues
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Validate service combination
  const validateServiceCombination = async () => {
    setLoadingValidation(true);
    try {
      const validation = await validateServices(selectedServices);

      // Ensure validation object has expected structure
      const validationResult = validation || {
        valid: false,
        error: "Validation failed",
      };
      setServiceValidation(validationResult);

      if (!validationResult.valid) {
        toast.error("Invalid Service Combination", {
          description:
            validationResult.error ||
            "This combination of services is not allowed",
        });
        setAvailableSlots([]);
        setSelectedTimeSlot(null);
      }
    } catch (error) {
      console.error("Validation error:", error);
      const errorMessage = error.message || "Failed to validate services";
      toast.error("Failed to validate services", {
        description: errorMessage,
      });
      setServiceValidation({ valid: false, error: errorMessage });
      setAvailableSlots([]);
      setSelectedTimeSlot(null);
    } finally {
      setLoadingValidation(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || selectedServices.length === 0) return;

    setLoadingSlots(true);
    try {
      const dateString = formatDateForAPI(selectedDate);
      const result = await getAvailableSlots(dateString, selectedServices);

      // Handle duration-aware slots
      if (result.slots) {
        setAvailableSlots(result.slots);
      } else {
        // Legacy format
        setAvailableSlots(result);
      }

      setSelectedTimeSlot(null);

      if ((result.slots || result).length === 0) {
        toast.info("No slots available", {
          description:
            "No available slots for this date with selected services. Try another date.",
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
    if (!selectedDate || !selectedTimeSlot || selectedServices.length === 0)
      return;

    // Verify user object is available (JWT is in HttpOnly cookie)
    if (!user) {
      toast.error("Authentication Required", {
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
        services: selectedServices,
        date: formatDateForAPI(selectedDate),
        timeSlot: selectedTimeSlot.startTime || selectedTimeSlot.time,
        vehicle: selectedVehicle,
        notes: notes.trim(),
      };

      console.log("Creating booking with data:", bookingData);
      await createBooking(bookingData);
      setBookingSuccess(true);

      const serviceName =
        selectedServices.length === 1
          ? selectedServices[0]
          : `${selectedServices.length} services`;
      const timeSlotDisplay =
        selectedTimeSlot.startTime || selectedTimeSlot.time;
      toast.success("Booking confirmed!", {
        description: `Your ${serviceName} appointment on ${selectedDate.toLocaleDateString()} at ${timeSlotDisplay} has been booked.`,
        action: {
          label: "View History",
          onClick: () => (window.location.href = "/dashboard/booking-history"),
        },
      });

      // Reset form and close dialog after successful booking
      setTimeout(() => {
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        setSelectedServices([]);
        setServiceValidation(null);
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
      } else if (
        error.message.includes("Admin users cannot") ||
        error.message.includes("Staff users cannot") ||
        error.message.includes("don't have permission")
      ) {
        toast.error("Access Denied", {
          description: error.message,
          action: {
            label: "Switch Account",
            onClick: () => navigate("/login"),
          },
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

  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    setSelectedTimeSlot(null);
    setError("");
  };

  const getTotalDuration = () => {
    if (serviceValidation?.totalDuration) {
      return serviceValidation.totalDuration;
    }
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  // Check if a service is incompatible with currently selected services
  const isServiceIncompatible = (serviceId) => {
    if (selectedServices.length === 0 || selectedServices.includes(serviceId)) {
      return false;
    }

    // Define incompatible combinations (matches backend validation)
    const incompatiblePairs = [
      ["UV Graphene Ceramic Coating", "Powder Coating"],
      ["Powder Coating", "Moto/Oto VIP"],
      ["Powder Coating", "Full Moto/Oto SPA"],
      ["Moto/Oto VIP", "Full Moto/Oto SPA"],
      ["Moto/Oto VIP", "Modernized Interior Detailing"],
      ["Moto/Oto VIP", "Modernized Engine Detailing"],
      ["Full Moto/Oto SPA", "Modernized Interior Detailing"],
      ["Full Moto/Oto SPA", "Modernized Engine Detailing"],
    ];

    // Check if the service conflicts with any selected service
    for (const pair of incompatiblePairs) {
      if (pair.includes(serviceId)) {
        const otherService = pair[0] === serviceId ? pair[1] : pair[0];
        if (selectedServices.includes(otherService)) {
          return true;
        }
      }
    }

    return false;
  };

  // Helper function to check if a time slot has passed for today
  const isTimeSlotPassed = (timeSlot) => {
    if (!selectedDate || !timeSlot) return false;

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (!isToday) return false;

    // Parse the time slot (handles both "9:00 AM" and object with startTime)
    const timeString =
      typeof timeSlot === "string"
        ? timeSlot
        : timeSlot.startTime || timeSlot.time;
    if (!timeString) return false;

    const timeSlotMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeSlotMatch) return false;

    let hours = parseInt(timeSlotMatch[1]);
    const minutes = parseInt(timeSlotMatch[2]);
    const period = timeSlotMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    // Create a date object for the time slot
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(hours, minutes, 0, 0);

    // Check if the slot time has passed
    return slotDateTime <= now;
  };

  const calendarDays = generateCalendarDays();

  // Show access denied screen if user is admin or staff
  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
  if (user && (userRoles.includes("admin") || userRoles.includes("staff"))) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <X className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-gray-700">
                {userRoles.includes("admin") ? "Admin" : "Staff"} users cannot
                create bookings. Only customer accounts can make bookings.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-gray-600">
              If you need to test the booking system, please create or log in
              with a customer account.
            </p>
            <Button
              onClick={() =>
                navigate(
                  userRoles.includes("admin")
                    ? "/admin/dashboard"
                    : "/staff/dashboard"
                )
              }
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Return to {userRoles.includes("admin") ? "Admin" : "Staff"}{" "}
              Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    {services.map((service, index) => {
                      const isIncompatible = isServiceIncompatible(service.id);
                      const isSelected = selectedServices.includes(service.id);

                      return (
                        <div
                          key={service.id}
                          onClick={() =>
                            !isIncompatible && handleServiceToggle(service.id)
                          }
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            isIncompatible
                              ? "border-gray-200 bg-gray-50 opacity-50 blur-[0.5px] cursor-not-allowed"
                              : isSelected
                              ? "border-red-500 bg-red-50 shadow-sm cursor-pointer"
                              : "border-gray-200 hover:border-red-200 hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-medium text-sm ${
                                  isIncompatible
                                    ? "text-gray-400"
                                    : isSelected
                                    ? "text-red-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {service.name}
                              </h3>
                              <p
                                className={`text-xs mt-1 ${
                                  isIncompatible
                                    ? "text-gray-400"
                                    : isSelected
                                    ? "text-red-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {service.description}
                              </p>
                              <div className="flex gap-1 mt-1">
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    isIncompatible
                                      ? "bg-gray-100 text-gray-400"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {service.duration}h
                                </span>
                              </div>
                            </div>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isIncompatible
                                  ? "bg-gray-200 text-gray-400"
                                  : isSelected
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {isIncompatible ? (
                                <X className="w-4 h-4" />
                              ) : isSelected ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <span className="text-xs font-semibold">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedServices.length > 0 && serviceValidation && (
                    <div className="mt-3">
                      {serviceValidation.valid ? (
                        <div className="text-xs bg-green-50 border border-green-200 rounded p-2 text-green-800">
                          ✓ Valid • {serviceValidation.totalDuration}h total
                        </div>
                      ) : (
                        <div className="text-xs bg-red-50 border border-red-200 rounded p-2 text-red-800">
                          {serviceValidation.error}
                        </div>
                      )}
                    </div>
                  )}
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
                        {availableSlots.map((slot) => {
                          // Handle both legacy format (slot.time) and new format (slot.startTime/endTime)
                          const slotTime = slot.startTime || slot.time;
                          const isPast = isTimeSlotPassed(slotTime);
                          const isSelected =
                            selectedTimeSlot?.startTime === slot.startTime ||
                            selectedTimeSlot?.time === slotTime;

                          return (
                            <button
                              key={slotTime}
                              onClick={() =>
                                !isPast && setSelectedTimeSlot(slot)
                              }
                              disabled={isPast}
                              className={`p-2.5 rounded-md border-2 transition-all duration-200 text-xs font-medium ${
                                isPast
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : isSelected
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : "border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700"
                              }`}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="font-semibold">
                                  {slotTime}
                                </span>
                                {slot.endTime && (
                                  <>
                                    <span className="text-[10px] opacity-60">
                                      to
                                    </span>
                                    <span className="font-medium">
                                      {slot.endTime}
                                    </span>
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        })}
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
                        selectedServices.length > 0
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            selectedServices.length > 0
                              ? "bg-red-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <Sparkles
                            className={`w-4 h-4 ${
                              selectedServices.length > 0
                                ? "text-white"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Service(s)
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {selectedServices.length > 0
                              ? `${selectedServices.length} service${
                                  selectedServices.length > 1 ? "s" : ""
                                } selected`
                              : "No service selected"}
                          </p>
                          {serviceValidation?.totalDuration && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Estimated Duration:{" "}
                              {serviceValidation.totalDuration}h
                            </p>
                          )}
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
                            Time Block
                          </p>
                          <p className="text-xs text-gray-600">
                            {selectedTimeSlot
                              ? selectedTimeSlot.endTime
                                ? // Show time range for multi-service bookings
                                  `${
                                    selectedTimeSlot.startTime ||
                                    selectedTimeSlot.time
                                  } - ${selectedTimeSlot.endTime}`
                                : // Show single time for legacy bookings
                                  selectedTimeSlot.time
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
                            selectedServices.length === 0 ||
                            !serviceValidation?.valid
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
                        {selectedServices.length === 0 ||
                        !serviceValidation?.valid
                          ? "Choose service(s) to start"
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
                            selectedServices.length === 0 ||
                            !serviceValidation?.valid
                          }
                          className={`w-full ${
                            selectedDate &&
                            selectedTimeSlot &&
                            selectedServices.length > 0 &&
                            serviceValidation?.valid
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                          size="lg"
                        >
                          {selectedDate &&
                          selectedTimeSlot &&
                          selectedServices.length > 0
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
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-600">
                                Service(s)
                              </span>
                              <div className="text-right">
                                {selectedServices.length === 1 ? (
                                  <span className="text-sm font-semibold text-gray-900">
                                    {selectedServices[0]}
                                  </span>
                                ) : (
                                  <div className="text-sm font-semibold text-gray-900">
                                    {selectedServices.map((srv, idx) => (
                                      <div key={idx}>{srv}</div>
                                    ))}
                                  </div>
                                )}
                                {serviceValidation?.totalDuration && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Estimated Duration:{" "}
                                    {serviceValidation.totalDuration}h
                                  </div>
                                )}
                              </div>
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
                                Time Block
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {selectedTimeSlot?.endTime
                                  ? `${
                                      selectedTimeSlot.startTime ||
                                      selectedTimeSlot.time
                                    } - ${selectedTimeSlot.endTime}`
                                  : selectedTimeSlot?.time}
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
