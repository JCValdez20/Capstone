import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import adminService from "@/services/adminService";

const AdminProtected = ({ adminOnly = false }) => {
  const isAuthenticated = adminService.isAuthenticated();
  const currentUser = adminService.getCurrentAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If adminOnly is true, only allow pure admin access
  if (adminOnly && currentUser?.roles !== "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Otherwise, allow both admin and staff
  if (
    !adminOnly &&
    currentUser?.roles !== "admin" &&
    currentUser?.roles !== "staff"
  ) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtected;
