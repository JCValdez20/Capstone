import logo from "../assets/WashUpLogo.png";
import React from "react";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  Home,
  Users,
  Settings,
  ChevronDown,
  User,
  Menu,
  Shield,
  Calendar,
  MessageCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminSidebar = ({ children }) => {
  const location = useLocation();
  const { getCurrentAdmin, getCurrentStaff, logout, isAdmin, user } = useAuth();

  // Determine the current user based on the current path
  const isStaffRoute = location.pathname.startsWith("/staff");
  const isAdminRoute = location.pathname.startsWith("/admin");

  const currentAdmin = getCurrentAdmin();
  const currentStaff = getCurrentStaff();
  const userIsAdmin = isAdmin();

  // Debug logging
  console.log("AdminSidebar Debug:", {
    userIsAdmin,
    user,
    userRoles: user?.roles,
    isStaffRoute,
    isAdminRoute,
    currentAdmin,
    currentStaff,
  });

  // Select the appropriate user based on current route
  let currentUser;
  if (isStaffRoute && currentStaff) {
    currentUser = currentStaff;
  } else if (isAdminRoute && currentAdmin) {
    currentUser = currentAdmin;
  } else {
    // Fallback: use whichever user is available
    currentUser = currentAdmin || currentStaff;
  }

  const handleLogout = () => {
    // Clear tokens and redirect based on current route
    logout();

    if (isStaffRoute) {
      window.location.href = "/staff/login";
    } else if (isAdminRoute) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/";
    }
  };

  const firstName = currentUser?.first_name || "User";
  const lastName = currentUser?.last_name || "User";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const userEmail = currentUser?.email || "user@washup.com";
  const userInitials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "UU";

  // Determine user role based on current route and user context
  let userRole;
  if (isStaffRoute) {
    userRole = "staff";
  } else if (isAdminRoute) {
    userRole = "admin";
  } else {
    // Fallback to actual user role
    userRole = currentUser?.roles || currentUser?.role;
  }

  const navItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: isStaffRoute ? "/staff/dashboard" : "/admin/dashboard",
      tooltip: "Dashboard",
    },
    {
      icon: Users,
      label: "User Management",
      path: isStaffRoute ? "/staff/users" : "/admin/users",
      tooltip: "Manage Users",
    },
    {
      icon: Calendar,
      label: "Booking Management",
      path: isStaffRoute ? "/staff/bookings" : "/admin/bookings",
      tooltip: "Manage Bookings",
    },
    // {
    //   icon: MessageCircle,
    //   label: "Messages",
    //   path: isStaffRoute ? "/staff/messages" : "/admin/messages",
    //   tooltip: "Messages & Chat",
    // },
    // Show Staff Management only for admin routes and admin users
    ...(!isStaffRoute && userIsAdmin
      ? [
          {
            icon: Shield,
            label: "Staff Management",
            path: "/admin/staff",
            tooltip: "Manage Staff",
          },
        ]
      : []),
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-white w-full">
        <Sidebar
          collapsible="icon"
          className="group/sidebar border-r border-slate-200 bg-white"
        >
          {/* HEADER */}
          <SidebarHeader className="flex flex-col items-center p-4 border-b border-slate-100">
            <SidebarTrigger className="mb-3 group-data-[collapsible=icon]:rotate-180 transition-transform duration-200" />

            <div className="flex flex-col items-center gap-2">
              {/* Logo - shows when expanded, Shield icon when collapsed */}
              <div className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:bg-red-500 group-data-[collapsible=icon]:rounded-lg flex items-center justify-center transition-all duration-200">
                <img
                  src={logo}
                  alt="WashUp Logo"
                  className="w-20 h-20 object-contain group-data-[collapsible=icon]:hidden"
                />
                <Shield className="w-4 h-4 text-white hidden group-data-[collapsible=icon]:block" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden text-center">
                <h1 className="text-lg font-black text-red-700">
                  WashUp {userRole === "admin" ? "Admin" : "Staff"}
                </h1>
                <p className="text-xs text-slate-500">Management Portal</p>
              </div>
            </div>
          </SidebarHeader>

          {/* CONTENT */}
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarMenu className="space-y-2">
                {navItems.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={item.path} className="w-full">
                          <SidebarMenuButton
                            isActive={location.pathname === item.path}
                            className={`w-full justify-start p-3 rounded-lg transition-all duration-200 ${
                              location.pathname === item.path
                                ? "bg-red-50 text-red-600 shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            <item.icon
                              className={`w-5 h-5 shrink-0 ${
                                location.pathname === item.path
                                  ? "text-red-600"
                                  : ""
                              }`}
                            />
                            <span className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden transition-all duration-200">
                              {item.label}
                            </span>
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="group-data-[state=expanded]:hidden"
                      >
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* FOOTER */}
          <SidebarFooter className="p-4 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors duration-200 group-data-[collapsible=icon]:justify-center">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-red-100 text-red-700 text-sm font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {fullName}
                    </p>
                    <p className="text-xs text-red-600 truncate">
                      {userRole === "admin" ? "Administrator" : "Staff"}
                    </p>
                  </div>

                  <ChevronDown className="w-4 h-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                className="w-56 bg-white border border-slate-200 shadow-lg rounded-lg"
                align="start"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">
                    {fullName}
                  </p>
                  <p className="text-xs text-red-600">
                    {userRole === "admin" ? "Administrator" : "Staff"}
                  </p>
                  <p className="text-xs text-slate-500">{userEmail}</p>
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />

                <DropdownMenuItem
                  className="gap-2 text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN */}
        <main className="flex-1 w-full overflow-auto bg-white min-w-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminSidebar;
