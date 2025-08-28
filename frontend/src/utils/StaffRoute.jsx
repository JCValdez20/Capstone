import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import adminService from "@/services/adminService";

const StaffProtected = () => {
  const isStaffAuthenticated = adminService.isStaffAuthenticated();

  if (!isStaffAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }

  return <Outlet />;
};

export default StaffProtected;
