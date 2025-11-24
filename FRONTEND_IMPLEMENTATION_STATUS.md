# Frontend Multi-Service Implementation Guide

## ✅ Completed Changes

### 1. **SimpleAuthContext.jsx** - ✅ UPDATED
- Added `validateServices` method
- Added `getServicesCatalog` method
- Updated `getAvailableSlots` to accept services parameter

### 2. **bookingService.js** - ✅ UPDATED
- Updated `getAvailableSlots(date, services)` to handle multi-service
- Added `validateServices(services)` method
- Added `getServicesCatalog()` method

---

## 🔄 Required UI Changes for Bookings.jsx

The Bookings.jsx component needs extensive updates. Here are the key changes needed:

### State Changes (Lines 36-51)
**REPLACE:**
```jsx
const [selectedService, setSelectedService] = useState(null);
```

**WITH:**
```jsx
const [selectedServices, setSelectedServices] = useState([]);
const [serviceValidation, setServiceValidation] = useState(null);
const [loadingValidation, setLoadingValidation] = useState(false);
```

### Service Array Update (Lines 93-130)
**ADD** duration and category to each service:
```jsx
const services = [
  {
    id: "UV Graphene Ceramic Coating",
    name: "UV Graphene Ceramic Coating",
    description: "Premium ceramic coating protection",
    duration: 4,        // ADD THIS
    category: "coating" // ADD THIS
  },
  // ... repeat for all services
];
```

### Service Selection UI (Around line 498)
**REPLACE** the entire service selection grid with checkboxes instead of radio buttons:

```jsx
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
      <input
        type="checkbox"
        checked={selectedServices.includes(service.id)}
        onChange={() => handleServiceToggle(service.id)}
        className="mt-1"
      />
      <div className="flex-1">
        <Label className="font-medium cursor-pointer">
          {service.name}
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          {service.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {service.duration}h
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {service.category}
          </span>
        </div>
      </div>
    </div>
  </div>
))}
```

### Validation Feedback (Add after service selection)
**ADD** validation feedback section:

```jsx
{selectedServices.length > 0 && (
  <div className="mt-4 space-y-3">
    {loadingValidation ? (
      <Alert>
        <AlertDescription>Validating service combination...</AlertDescription>
      </Alert>
    ) : serviceValidation ? (
      serviceValidation.valid ? (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="flex items-center justify-between">
            <span className="text-green-800">✓ Valid combination</span>
            <span className="font-semibold text-green-900">
              Total Duration: {serviceValidation.totalDuration} hours
            </span>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            {serviceValidation.error}
          </AlertDescription>
        </Alert>
      )
    ) : null}
  </div>
)}
```

### Progress Steps (Around line 680-710)
**UPDATE** Step 1 indicator:

```jsx
<div className={`step ${selectedServices.length > 0 ? "bg-red-500" : "bg-gray-300"}`}>
  <span className={`text ${selectedServices.length > 0 ? "text-white" : "text-gray-500"}`}>
    1
  </span>
</div>
<span className={`ml-2 text-sm ${selectedServices.length > 0 ? "text-gray-900" : "text-gray-500"}`}>
  {selectedServices.length > 0 
    ? `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} selected`
    : "Select Service(s)"}
</span>
```

### Booking Button (Around line 834-843)
**UPDATE** booking button disabled condition:

```jsx
<Button
  onClick={handleBooking}
  disabled={
    !selectedServices.length ||
    !selectedDate ||
    !selectedTimeSlot ||
    serviceValidation?.valid === false
  }
  className="w-full"
  size="lg"
>
  {selectedDate && selectedTimeSlot && selectedServices.length > 0
    ? "Confirm Booking"
    : "Complete all steps to book"}
</Button>
```

### Booking Summary (Around line 850)
**UPDATE** to show all selected services:

```jsx
{selectedServices.length > 0 && (
  <div className="flex items-center gap-2">
    <Sparkles className="w-4 h-4 text-red-600" />
    <div>
      <div className="text-sm font-medium">
        {selectedServices.length === 1 
          ? selectedServices[0]
          : `${selectedServices.length} services`}
      </div>
      {serviceValidation?.totalDuration && (
        <div className="text-xs text-gray-500">
          Duration: {serviceValidation.totalDuration} hours
        </div>
      )}
    </div>
  </div>
)}
```

### Time Slot Display
**UPDATE** to show end time:

```jsx
{availableSlots.map((slot, index) => (
  <Button
    key={index}
    onClick={() => setSelectedTimeSlot(slot)}
    variant={selectedTimeSlot === slot ? "default" : "outline"}
    className="py-6 px-4"
  >
    <div className="flex flex-col items-center">
      <Clock className="w-4 h-4 mb-1" />
      <span className="font-semibold">
        {slot.startTime || slot.time}
      </span>
      {slot.endTime && (
        <span className="text-xs opacity-75">
          to {slot.endTime}
        </span>
      )}
    </div>
  </Button>
))}
```

---

## Alternative: Use Simplified Version

If full checkbox implementation is too complex, you can use a **simpler hybrid approach**:

1. Keep single service selection UI
2. Update backend calls to send as array
3. Add multi-service later

**Minimal changes for hybrid:**

```jsx
// In handleBooking
const bookingData = {
  services: selectedService ? [selectedService.id] : [], // Send as array
  date: formatDateForAPI(selectedDate),
  timeSlot: selectedTimeSlot.time,
  vehicle: selectedVehicle,
  notes: notes.trim(),
};
```

This allows backend to accept the new format while keeping UI simple for now.

---

## Next Steps

**Option A: Continue Full Implementation**
I can continue updating the remaining 15+ locations in Bookings.jsx to fully implement multi-service selection with checkboxes.

**Option B: Hybrid Approach**
Keep current UI, just modify the data structure sent to backend.

**Option C: Manual Update**
Use this guide to manually update Bookings.jsx at your own pace.

Which option would you prefer?
