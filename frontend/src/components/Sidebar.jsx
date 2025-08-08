import React from "react";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "../hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  Home,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  User,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";

const AppSidebar = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const firstName = user?.first_name || "Sandra";
  const lastName = user?.last_name || "Marx";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const userEmail = user?.email || "sandra@gmail.com";
  const userInitial = firstName.charAt(0).toUpperCase() || "S";

  const navItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/dashboard",
      tooltip: "Go to Dashboard",
    },
    {
      icon: CalendarDays,
      label: "Booking History",
      path: "/booking-history",
      tooltip: "View booking history",
    },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen">
        <Sidebar
          collapsible="icon"
          className="w-64 data-[collapsed=true]:w-[120px]
 transition-all duration-300 bg-white border-r border-gray-200"
        >
          {/* HEADER */}
          <SidebarHeader className="flex items-center p-4 h-16 border-b border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="size-8 hover:bg-gray-100 rounded flex items-center justify-center ml-auto">
                  <ChevronRight className="sidebar-collapsed:rotate-180 transition-transform duration-200 text-gray-500" />
                </SidebarTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Toggle sidebar</TooltipContent>
            </Tooltip>
          </SidebarHeader>

          {/* CONTENT */}
          <SidebarContent className="flex flex-col flex-grow">
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider hidden sidebar-expanded:block">
                Navigation
              </SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={item.path} className="w-full">
                          <SidebarMenuButton
                            isActive={location.pathname === item.path}
                            className={`w-full justify-start px-4 py-3 flex items-center gap-3 rounded-md transition-colors ${
                              location.pathname === item.path
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <item.icon
                              className="size-6"
                              style={{ minWidth: "24px", minHeight: "24px" }}
                            />
                            <span className="sidebar-collapsed:hidden">
                              {item.label}
                            </span>
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* FOOTER */}
          <SidebarFooter className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-gray-200 text-gray-800">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <ChevronDown className="size-4 text-gray-500 hidden sidebar-expanded:block" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                className="w-[var(--radix-dropdown-menu-trigger-width)]"
                align="start"
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900">
                    {fullName}
                  </p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <DropdownMenuItem className="gap-2 text-gray-700 hover:bg-gray-50">
                  <User className="size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-gray-700 hover:bg-gray-50"
                  onClick={logout}
                >
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
