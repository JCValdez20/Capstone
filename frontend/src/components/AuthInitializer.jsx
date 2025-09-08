import React, { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Skeleton } from "./ui/skeleton";

const AuthInitializer = ({ children }) => {
  const { checkAuth, isLoading, isAuthenticated, isAdminOrStaff } =
    useAuthStore();
  const { initializeChat } = useChatStore();

  useEffect(() => {
    // Initialize authentication on app start
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Initialize chat when user is authenticated and has admin/staff role
    if (isAuthenticated() && isAdminOrStaff()) {
      initializeChat();
    }
  }, [isAuthenticated, isAdminOrStaff, initializeChat]);

  if (isLoading) {
    return (
      <div className="w-full p-8 space-y-6 max-w-2xl mx-auto">
        {/* Header Loading */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>

        {/* Content Loading */}
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer;
