import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { LogOut } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const Dashboard = () => {
  const { logout, user } = useAuth();

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <Button variant="outline" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="space-y-4">
        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              {user.isGoogleUser && (
                <span className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded-full">
                  <FcGoogle className="h-4 w-4" />
                  <span>Google User</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>

              {user.first_name && user.last_name && (
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
