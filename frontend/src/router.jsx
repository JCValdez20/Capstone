import { createBrowserRouter } from "react-router-dom";

// Layouts
import RootLayout from "./RootLayout.jsx";
import AppSidebar from "./components/Sidebar.jsx";
import AdminSidebar from "./components/AdminSidebar.jsx";

// Auth
import AuthRedirect from "./utils/AuthRedirect.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import AdminProtected from "./utils/AdminRoute.jsx";
import StaffProtected from "./utils/StaffRoute.jsx";

// Pages
import LandingPage from "./pages/landing-page/LandingPage.jsx";
import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import EmailVerification from "./pages/auth/EmailVerification.jsx";
import GoogleCallbackHandler from "./utils/GoogleCallbackHandler.jsx";

// User pages
import Dashboard from "./pages/user/dashboard/Dashboard.jsx";
import BookingHistory from "./pages/user/dashboard/BookingHistory.jsx";
import Profile from "./pages/user/profile/Profile.jsx";

// Admin pages
import AdminLogin from "./pages/admin/login/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard.jsx";
import UserManagement from "./pages/admin/dashboard/UserManagement.jsx";
import AdminBookings from "./pages/admin/dashboard/AdminBookings.jsx";
import StaffManagement from "./pages/admin/dashboard/StaffManagement.jsx";
import AdminMessages from "./pages/admin/dashboard/AdminMessages.jsx";

// Staff pages
import StaffLogin from "./pages/staff/login/StaffLogin.jsx";
import StaffDashboard from "./pages/staff/dashboard/StaffDashboard.jsx";
import StaffUserManagement from "./pages/staff/dashboard/StaffUserManagement.jsx";
import StaffBookings from "./pages/staff/dashboard/StaffBookings.jsx";
import StaffMessages from "./pages/staff/dashboard/StaffMessages.jsx";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },

      // AUTH
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
      { path: "/verify-email", element: <EmailVerification /> },
      { path: "/auth/callback/google", element: <GoogleCallbackHandler /> },
      {
        path: "/admin/login",
        element: (
          <AuthRedirect>
            <AdminLogin />
          </AuthRedirect>
        ),
      },
      {
        path: "/staff/login",
        element: (
          <AuthRedirect>
            <StaffLogin />
          </AuthRedirect>
        ),
      },

      // ------------------------------
      // ADMIN ROUTES
      // ------------------------------
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
          {
            path: "/admin/messages",
            element: (
              <AdminSidebar>
                <AdminMessages />
              </AdminSidebar>
            ),
          },
          {
            path: "/admin/staff",
            element: (
              <AdminSidebar>
                <StaffManagement />
              </AdminSidebar>
            ),
          },
        ],
      },

      // ------------------------------
      // STAFF ROUTES
      // ------------------------------
      {
        element: <StaffProtected />,
        children: [
          {
            path: "/staff/dashboard",
            element: (
              <AdminSidebar>
                <StaffDashboard />
              </AdminSidebar>
            ),
          },
          {
            path: "/staff/users",
            element: (
              <AdminSidebar>
                <StaffUserManagement />
              </AdminSidebar>
            ),
          },
          {
            path: "/staff/bookings",
            element: (
              <AdminSidebar>
                <StaffBookings />
              </AdminSidebar>
            ),
          },
          {
            path: "/staff/messages",
            element: (
              <AdminSidebar>
                <StaffMessages />
              </AdminSidebar>
            ),
          },
        ],
      },

      // ------------------------------
      // USER ROUTES
      // ------------------------------
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
    ],
  },
]);

export default router;
