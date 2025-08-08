import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import adminService from "@/services/adminService";

const AdminProtected = () => {
  const isAuthenticated = adminService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtected;
