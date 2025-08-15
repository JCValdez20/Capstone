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
import adminService from "@/services/adminService";

const AdminSidebar = ({ children }) => {
  const location = useLocation();
  const currentAdmin = adminService.getCurrentAdmin();

  const handleLogout = () => {
    adminService.logout();
    window.location.href = "/admin/login";
  };

  const firstName = currentAdmin?.first_name || "Admin";
  const lastName = currentAdmin?.last_name || "User";
  const fullName = `${firstName} ${lastName}`.trim() || "Admin";
  const userEmail = currentAdmin?.email || "admin@washup.com";
  const userInitials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "AU";

  const navItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/admin/dashboard",
      tooltip: "Admin Dashboard",
    },
    {
      icon: Users,
      label: "User Management",
      path: "/admin/users",
      tooltip: "Manage Users",
    },
    {
      icon: Calendar,
      label: "Booking Management",
      path: "/admin/bookings",
      tooltip: "Manage Bookings",
    },
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
                  src="/src/assets/WashUpLogo.png"
                  alt="WashUp Logo"
                  className="w-20 h-20 object-contain group-data-[collapsible=icon]:hidden"
                />
                <Shield className="w-4 h-4 text-white hidden group-data-[collapsible=icon]:block" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden text-center">
                <h1 className="text-lg font-black text-red-700">
                  WashUp Admin
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
                      Administrator
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
                  <p className="text-xs text-red-600">Administrator</p>
                  <p className="text-xs text-slate-500">{userEmail}</p>
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="gap-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
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
