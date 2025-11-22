// src/utils/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { isLoading, isAuthenticated, isAdmin, isStaff, isCustomer } =
    useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Only allow customers to access customer routes
  if (!isCustomer()) {
    // Admin/Staff trying to access customer pages - redirect to their dashboard
    if (isAdmin()) return <Navigate to="/admin/dashboard" replace />;
    if (isStaff()) return <Navigate to="/staff/dashboard" replace />;
  }

  // Customer access
  return <Outlet />;
};

export default ProtectedRoute;
