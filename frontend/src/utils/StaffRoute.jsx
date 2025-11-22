// src/utils/StaffRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const StaffProtected = () => {
  const { isLoading, isAuthenticated, isAdmin, isStaff } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/staff/login" replace />;
  }

  // Check if user has staff or admin role
  if (isStaff() || isAdmin()) {
    return <Outlet />;
  }

  // Customers cannot access staff panel - redirect to customer login
  return <Navigate to="/login" replace />;
};

export default StaffProtected;
