// src/utils/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const AdminProtected = ({ adminOnly = false }) => {
  const { isLoading, isAuthenticated, isAdmin, isStaff } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin-only pages
  if (adminOnly && !isAdmin()) {
    if (isStaff()) return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin or staff role
  if (isAdmin() || isStaff()) {
    return <Outlet />;
  }

  // Customers cannot access admin panel - redirect to customer login
  return <Navigate to="/login" replace />;
};

export default AdminProtected;
