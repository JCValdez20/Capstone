import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";

import "./index.css";

import LandingPage from "./pages/landing-page/LandingPage.jsx";
import Register from "./pages/register/Register.jsx";
import Login from "./pages/login/Login.jsx";
import Dashboard from "./pages/user/dashboard-page/Dashboard.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import GoogleCallbackHandler from "./utils/GoogleCallbackHandler.jsx";
import AppSidebar from "./components/Sidebar.jsx";
import AuthRedirect from "./utils/AuthRedirect.jsx";
import BookingHistory from "./pages/user/dashboard-content/BookingHistory.jsx";
import AdminProtected from "./utils/AdminRoute.jsx";

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
    path: "/auth/callback/google",
    element: <GoogleCallbackHandler />,
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
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
