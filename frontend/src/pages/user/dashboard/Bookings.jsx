import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../../hooks/useAuth";
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
} from "lucide-react";

const Bookings = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      
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

  const timeSlots = [
    { id: 1, time: "9:00 AM", available: true },
    { id: 2, time: "10:00 AM", available: true },
    { id: 3, time: "11:00 AM", available: false },
    { id: 4, time: "1:00 PM", available: true },
    { id: 5, time: "2:00 PM", available: true },
    { id: 6, time: "3:00 PM", available: true },
    { id: 7, time: "4:00 PM", available: false },
    { id: 8, time: "5:00 PM", available: true },
  ];

  const services = [
    {
      id: 1,
      name: "Basic Wash",
      description: "Exterior wash and dry",
      price: 15,
      duration: "30 min",
      popular: false,
    },
    {
      id: 2,
      name: "Premium Wash",
      description: "Interior + Exterior cleaning",
      price: 25,
      duration: "45 min",
      popular: true,
    },
    {
      id: 3,
      name: "Deluxe Detail",
      description: "Full detailing service",
      price: 45,
      duration: "90 min",
      popular: false,
    },
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateSelect = (day) => {
    if (day.isPastDate || !day.isCurrentMonth) return;
    setSelectedDate(day.date);
  };

  const handleBooking = () => {
    if (selectedDate && selectedTimeSlot && selectedService) {
      alert(`Booking confirmed!\nDate: ${selectedDate.toDateString()}\nTime: ${selectedTimeSlot.time}\nService: ${selectedService.name}`);
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h1 className="text-2xl font-light text-black mb-1">
          Welcome back, <span className="text-red-800 font-medium">{fullName}</span>
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
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
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
                  <div key={`day-header-${index}`} className="p-3 text-center text-sm font-medium text-gray-400">
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
                      ${day.isCurrentMonth 
                        ? day.isPastDate 
                          ? "text-gray-300 cursor-not-allowed" 
                          : "text-black hover:bg-gray-50" 
                        : "text-gray-200"
                      }
                      ${day.isToday ? "bg-gray-100 text-black font-semibold ring-2 ring-gray-200" : ""}
                      ${day.isSelected ? "bg-red-800 text-white font-semibold shadow-lg scale-105" : ""}
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
              <div className="grid grid-cols-1 gap-2 max-h-full overflow-y-hidden">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && setSelectedTimeSlot(slot)}
                    disabled={!slot.available}
                    className={`
                      p-2 rounded-lg border transition-all duration-200 text-center text-xs
                      ${slot.available 
                        ? selectedTimeSlot?.id === slot.id
                          ? "border-red-800 bg-red-800 text-white"
                          : "border-gray-200 hover:border-gray-300 text-black"
                        : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    <div className="font-medium">{slot.time}</div>
                    <div className="opacity-70">
                      {slot.available ? "Available" : "Unavailable"}
                    </div>
                  </button>
                ))}
              </div>
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
              <div className="space-y-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all duration-200 relative
                      ${selectedService?.id === service.id
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
                        <p className={`text-xs ${selectedService?.id === service.id ? 'text-red-100' : 'text-gray-600'}`}>
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
            </div>

            {/* Booking Summary */}
            <div className="border border-gray-100 rounded-2xl p-4">
              <h2 className="text-lg font-medium text-black mb-3">
                Summary
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-gray-600 text-xs">Date</span>
                  <span className="text-black font-medium text-xs">
                    {selectedDate ? selectedDate.toLocaleDateString() : "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-gray-600 text-xs">Time</span>
                  <span className="text-black font-medium text-xs">
                    {selectedTimeSlot ? selectedTimeSlot.time : "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-gray-600 text-xs">Service</span>
                  <span className="text-black font-medium text-xs">
                    {selectedService ? selectedService.name : "Not selected"}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTimeSlot || !selectedService}
                className="w-full bg-red-800 hover:bg-red-900 text-white py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
