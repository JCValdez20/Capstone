import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../hooks/useAuth";
import { LogOut } from "lucide-react";
import Bookings from "../dashboard-content/Bookings";

const Dashboard = () => {
  const { user } = useAuth();

  // Get user's full name or default to "User"
  const fullName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : "User";

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-primary">{fullName}</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your BookUp MotMot reservations
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg">
        <Bookings />
      </div>
    </div>
  );
};

export default Dashboard;
