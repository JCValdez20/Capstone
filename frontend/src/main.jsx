import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { Toaster } from "./components/ui/sonner.jsx";

import "./index.css";

import LandingPage from "./pages/landing-page/LandingPage.jsx";
import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import EmailVerification from "./pages/auth/EmailVerification.jsx";
import Dashboard from "./pages/user/dashboard/Dashboard.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import GoogleCallbackHandler from "./utils/GoogleCallbackHandler.jsx";
import AppSidebar from "./components/Sidebar.jsx";
import AuthRedirect from "./utils/AuthRedirect.jsx";
import BookingHistory from "./pages/user/dashboard/BookingHistory.jsx";
import Profile from "./pages/user/profile/Profile.jsx";
import AdminProtected from "./utils/AdminRoute.jsx";
import AdminLogin from "./pages/admin/login/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard.jsx";
import UserManagement from "./pages/admin/dashboard/UserManagement.jsx";
import AdminBookings from "./pages/admin/dashboard/AdminBookings.jsx";
import AdminSidebar from "./components/AdminSidebar.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/register",
    element: (
      <AuthRedirect>
        <Register />
      </AuthRedirect>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthRedirect>
        <Login />
      </AuthRedirect>
    ),
  },
  {
    path: "/verify-email",
    element: <EmailVerification />,
  },
  {
    path: "/auth/callback/google",
    element: <GoogleCallbackHandler />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    element: <AdminProtected />,
    children: [
      {
        path: "/admin/dashboard",
        element: (
          <AdminSidebar>
            <AdminDashboard />
          </AdminSidebar>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <AdminSidebar>
            <UserManagement />
          </AdminSidebar>
        ),
      },
      {
        path: "/admin/bookings",
        element: (
          <AdminSidebar>
            <AdminBookings />
          </AdminSidebar>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: (
          <AppSidebar>
            <Dashboard />
          </AppSidebar>
        ),
      },
      {
        path: "/booking-history",
        element: (
          <AppSidebar>
            <BookingHistory />
          </AppSidebar>
        ),
      },
      {
        path: "/profile",
        element: (
          <AppSidebar>
            <Profile />
          </AppSidebar>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  </StrictMode>
);
