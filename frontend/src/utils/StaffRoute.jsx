import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const StaffProtected = () => {
  const { isStaffAuthenticated } = useAuth();

  if (!isStaffAuthenticated()) {
    return <Navigate to="/staff/login" replace />;
  }

  return <Outlet />;
};

export default StaffProtected;
