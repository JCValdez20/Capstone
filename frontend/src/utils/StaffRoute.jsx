import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import adminService from "@/services/adminService";

const StaffProtected = () => {
  const isAuthenticated = adminService.isAuthenticated();
  const currentUser = adminService.getCurrentAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Only allow staff access
  if (currentUser?.roles !== "staff") {
    // If they're admin, redirect to admin dashboard
    if (currentUser?.roles === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Otherwise, redirect to login
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default StaffProtected;
