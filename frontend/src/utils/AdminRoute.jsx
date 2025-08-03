import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminProtected = () => {
  const { isLoggedIn, role, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return isLoggedIn && role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" />
  );
};

export default AdminProtected;
