/**
 * MULTI-SERVICE BOOKING COMPONENT - EXAMPLE IMPLEMENTATION
 * 
 * This is a reference implementation showing how to update Bookings.jsx
 * to support multi-service selection with duration-based scheduling.
 * 
 * Key Features:
 * 1. Multi-service checkbox selection
 * 2. Real-time validation of service combinations
 * 3. Dynamic duration calculation
 * 4. Duration-aware time slot generation
 * 5. Display of start time and end time
 * 
 * USAGE: Integrate these concepts into your existing Bookings.jsx component
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "sonner";
import { Clock, AlertTriangle } from "lucide-react";

const MultiServiceBooking = () => {
  // State management
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceValidation, setServiceValidation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { createBooking } = useAuth();

  // Service catalog with durations
  const services = [
    {
      id: "UV Graphene Ceramic Coating",
      name: "UV Graphene Ceramic Coating",
      duration: 4,
      description: "Premium ceramic coating protection",
      category: "coating",
    },
    {
      id: "Powder Coating",
      name: "Powder Coating",
      duration: 2,
      description: "Durable powder coating finish",
      category: "coating",
    },
    {
      id: "Moto/Oto VIP",
      name: "Moto/Oto VIP",
      duration: 3,
      description: "VIP motorcycle treatment",
      category: "package",
    },
    {
      id: "Full Moto/Oto SPA",
      name: "Full Moto/Oto SPA",
      duration: 4,
      description: "Complete spa treatment",
      category: "package",
    },
    {
      id: "Modernized Interior Detailing",
      name: "Modernized Interior Detailing",
      duration: 1.5,
      description: "Interior detailing service",
      category: "detailing",
    },
    {
      id: "Modernized Engine Detailing",
      name: "Modernized Engine Detailing",
      duration: 1.5,
      description: "Engine cleaning and detailing",
      category: "detailing",
    },
  ];

  // Validate service combination when services change
  useEffect(() => {
    if (selectedServices.length > 0) {
      validateServiceCombination();
    } else {
      setServiceValidation(null);
    }
  }, [selectedServices]);

  // Fetch available slots when date or validated services change
  useEffect(() => {
    if (selectedDate && serviceValidation?.valid) {
      fetchAvailableSlots();
    }
  }, [selectedDate, serviceValidation]);

  // Validate service combination
  const validateServiceCombination = async () => {
    setLoadingValidation(true);
    try {
      const response = await fetch('/api/bookings/validate-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: selectedServices }),
      });

      const result = await response.json();
      setServiceValidation(result.data);

      if (!result.data.valid) {
        toast.error("Invalid Service Combination", {
          description: result.data.error,
        });
        setAvailableSlots([]);
        setSelectedTimeSlot(null);
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate services");
    } finally {
      setLoadingValidation(false);
    }
  };

  // Fetch available slots based on selected services
  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const dateString = formatDateForAPI(selectedDate);
      const servicesParam = JSON.stringify(selectedServices);
      
      const response = await fetch(
        `/api/bookings/available-slots/${dateString}?services=${encodeURIComponent(servicesParam)}`
      );
      
      const result = await response.json();
      setAvailableSlots(result.data.availableSlots || []);
      setSelectedTimeSlot(null);

      if (result.data.availableSlots?.length === 0) {
        toast.info("No available slots", {
          description: "No time slots available for this date with selected services.",
        });
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load time slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle service selection toggle
  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    // Reset selections when services change
    setSelectedTimeSlot(null);
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || selectedServices.length === 0) {
      toast.error("Missing information", {
        description: "Please select services, date, and time slot.",
      });
      return;
    }

    if (!serviceValidation?.valid) {
      toast.error("Invalid service combination");
      return;
    }

    try {
      const bookingData = {
        services: selectedServices,
        date: formatDateForAPI(selectedDate),
        timeSlot: selectedTimeSlot.startTime,
        vehicle: "motorcycle",
        notes: "",
      };

      await createBooking(bookingData);
      
      toast.success("Booking confirmed!", {
        description: `Your booking for ${serviceValidation.totalDuration} hours has been created.`,
      });

      // Reset form
      setSelectedServices([]);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setServiceValidation(null);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Booking failed", {
        description: error.message || "Please try again.",
      });
    }
  };

  // Helper function
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Service Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Select Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedServices.includes(service.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleServiceToggle(service.id)}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={() => handleServiceToggle(service.id)}
                />
                <div className="flex-1">
                  <Label className="font-medium cursor-pointer">
                    {service.name}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {service.duration} {service.duration === 1 ? "hour" : "hours"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Feedback */}
        {selectedServices.length > 0 && (
          <div className="mt-6 space-y-3">
            {loadingValidation ? (
              <Alert>
                <AlertDescription>Validating service combination...</AlertDescription>
              </Alert>
            ) : serviceValidation ? (
              serviceValidation.valid ? (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-green-800">
                      ✓ Valid combination
                    </span>
                    <span className="font-semibold text-green-900">
                      Total Duration: {serviceValidation.totalDuration} hours
                    </span>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {serviceValidation.error}
                  </AlertDescription>
                </Alert>
              )
            ) : null}
          </div>
        )}
      </Card>

      {/* Step 2: Date Selection (show only if services are valid) */}
      {serviceValidation?.valid && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Select Date</h2>
          {/* Insert your calendar component here */}
          <p className="text-sm text-gray-500">
            Calendar component goes here...
          </p>
        </Card>
      )}

      {/* Step 3: Time Slot Selection (show only if date is selected) */}
      {selectedDate && serviceValidation?.valid && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 3: Select Time Slot
          </h2>
          
          {loadingSlots ? (
            <p>Loading available slots...</p>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSlots.map((slot, index) => (
                <Button
                  key={index}
                  variant={
                    selectedTimeSlot?.startTime === slot.startTime
                      ? "default"
                      : "outline"
                  }
                  className="h-auto py-3 px-4 flex flex-col items-start"
                  onClick={() => setSelectedTimeSlot(slot)}
                >
                  <span className="font-semibold text-sm">
                    {slot.startTime}
                  </span>
                  <span className="text-xs opacity-75">
                    to {slot.endTime}
                  </span>
                  <span className="text-xs opacity-60 mt-1">
                    ({slot.duration} hrs)
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No available slots for this date. Please select another date.
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* Step 4: Confirm Booking */}
      {selectedTimeSlot && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
          
          <div className="space-y-2 text-sm mb-4">
            <p>
              <span className="font-medium">Services:</span>{" "}
              {selectedServices.join(", ")}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {selectedDate?.toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Time:</span>{" "}
              {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
            </p>
            <p>
              <span className="font-medium">Duration:</span>{" "}
              {serviceValidation.totalDuration} hours
            </p>
          </div>

          <Button
            onClick={handleBooking}
            className="w-full"
            size="lg"
          >
            Confirm Booking
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MultiServiceBooking;
