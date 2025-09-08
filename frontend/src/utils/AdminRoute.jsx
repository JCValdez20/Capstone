import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminProtected = ({ adminOnly = false }) => {
  const { isAdminAuthenticated, isStaffAuthenticated } = useAuth();

  // If adminOnly is true, only allow pure admin access
  if (adminOnly) {
    if (!isAdminAuthenticated()) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Outlet />;
  }

  // Otherwise, allow both admin and staff (but they must be authenticated in their respective roles)
  if (!isAdminAuthenticated() && !isStaffAuthenticated()) {
    // Neither admin nor staff is logged in
    return <Navigate to="/admin/login" replace />;
  }

  // If staff is accessing admin routes, use staff authentication
  if (isStaffAuthenticated() && !isAdminAuthenticated()) {
    // Staff can access admin routes (like dashboard, user management)
    return <Outlet />;
  }

  // If admin is accessing, use admin authentication
  if (isAdminAuthenticated()) {
    return <Outlet />;
  }

  // Fallback to login
  return <Navigate to="/admin/login" replace />;
};

export default AdminProtected;
