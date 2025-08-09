import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

const Bookings = () => {
  const { user } = useAuth();
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
    const lastDay = new Date(year, month + 1, 0);
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
      toast.error("Booking failed", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the problem persists.",
      });
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
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h1 className="text-2xl font-light text-black mb-1">
          Welcome back,{" "}
          <span className="text-red-800 font-medium">{fullName}</span>
        </h1>
        <p className="text-gray-600 text-sm">
          Schedule your motorcycle wash appointment
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full grid grid-cols-5 gap-4">
          {/* Center Column - Calendar (Main Focus) */}
          <div className="col-span-3 flex flex-col">
            {/* Calendar Section */}
            <div className="flex-1 border border-gray-100 rounded-2xl p-6">
              <h2 className="text-2xl font-medium text-black mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-red-800" />
                Select Date
              </h2>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                  className="p-3 hover:bg-gray-50 text-black"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="font-medium text-xl text-black">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(1)}
                  className="p-3 hover:bg-gray-50 text-black"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <div
                    key={`day-header-${index}`}
                    className="p-3 text-center text-sm font-medium text-gray-400"
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
                      p-3 text-sm rounded-xl transition-all duration-200 relative font-medium
                      ${
                        day.isCurrentMonth
                          ? day.isPastDate
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-black hover:bg-gray-50"
                          : "text-gray-200"
                      }
                      ${
                        day.isToday
                          ? "bg-gray-100 text-black font-semibold ring-2 ring-gray-200"
                          : ""
                      }
                      ${
                        day.isSelected
                          ? "bg-red-800 text-white font-semibold shadow-lg scale-105"
                          : ""
                      }
                    `}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Left Column - Time Slots */}
          <div className="col-span-1 flex flex-col">
            <div className="flex-1 border border-gray-100 rounded-2xl p-4">
              <h2 className="text-lg font-medium text-black mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-800" />
                Time Slots
              </h2>

              {!selectedDate && (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Select a date first</p>
                </div>
              )}

              {selectedDate && loadingSlots && (
                <div className="space-y-2 pr-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg border border-gray-200"
                    >
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              )}

              {selectedDate && !loadingSlots && (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 gap-2 pr-4">
                    {availableSlots.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        <p>No slots available for this date</p>
                      </div>
                    ) : (
                      availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`
                            p-2 rounded-lg border transition-all duration-200 text-center text-xs
                            ${
                              selectedTimeSlot?.time === slot.time
                                ? "border-red-800 bg-red-800 text-white"
                                : "border-gray-200 hover:border-gray-300 text-black"
                            }
                          `}
                        >
                          <div className="font-medium">{slot.time}</div>
                          <div className="opacity-70">Available</div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Right Column - Services & Summary */}
          <div className="col-span-1 flex flex-col gap-4">
            {/* Service Selection */}
            <div className="flex-1 border border-gray-100 rounded-2xl p-4">
              <h2 className="text-lg font-medium text-black mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-800" />
                Services
              </h2>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all duration-200 relative
                        ${
                          selectedService?.id === service.id
                            ? "border-red-800 bg-red-800 text-white"
                            : "border-gray-200 hover:border-gray-300 text-black"
                        }
                      `}
                    >
                      {service.popular && (
                        <div className="absolute -top-1 -right-1 bg-black text-white px-1 py-0.5 rounded-full text-xs font-medium">
                          Popular
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">
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
                        {selectedService?.id === service.id && (
                          <div className="ml-2">
                            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                              <Check className="w-1.5 h-1.5 text-red-800" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Book Now Button */}
            <div className="border border-gray-100 rounded-2xl p-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={
                      !selectedDate || !selectedTimeSlot || !selectedService
                    }
                    className="w-full bg-red-800 hover:bg-red-900 text-white py-3 text-lg font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200"
                  >
                    Book Now
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
