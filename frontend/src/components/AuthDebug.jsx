import React from "react";
import { useAuth } from "../hooks/useAuth";

const AuthDebug = () => {
  const auth = useAuth();

  const storageData = {
    adminToken: localStorage.getItem("adminToken"),
    adminUser: localStorage.getItem("adminUser"),
    staffToken: localStorage.getItem("staffToken"),
    staffUser: localStorage.getItem("staffUser"),
    customerToken: localStorage.getItem("token"),
    customerUser: localStorage.getItem("user"),
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-auto z-50">
      <h3 className="font-bold text-lg mb-2">🔍 Auth Debug</h3>

      <div className="space-y-2">
        <div>
          <strong>Auth State:</strong>
          <pre className="bg-gray-100 p-2 text-xs rounded">
            {JSON.stringify(
              {
                isLoggedIn: auth.isLoggedIn,
                role: auth.role,
                authType: auth.authType,
                userId: auth.user?.id,
                userRoles: auth.user?.roles,
                isAdmin: auth.isAdmin,
                isStaff: auth.isStaff,
                isAdminOrStaff: auth.isAdminOrStaff,
                hasSocket: !!auth.socket,
                isLoading: auth.isLoading,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div>
          <strong>localStorage:</strong>
          <pre className="bg-gray-100 p-2 text-xs rounded">
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </div>

        <div>
          <strong>User Object:</strong>
          <pre className="bg-gray-100 p-2 text-xs rounded">
            {JSON.stringify(auth.user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
