// src/utils/AuthRedirect.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const AuthRedirect = ({ children, redirectPath = "/dashboard" }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="w-full p-8 space-y-6 max-w-2xl mx-auto">
        {/* Simple loading skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    );
  }

  if (isAuthenticated()) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return children;
};

export default AuthRedirect;
