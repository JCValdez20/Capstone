import React, { useMemo } from "react";
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
import { useAuth } from "../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Home,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  User,
  Menu,
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

const AppSidebar = ({ children }) => {
  const { logout, user, forceUpdateTrigger } = useAuth();
  const location = useLocation();

  // Simple, direct user data - no complex memoization
  const currentUser = user || {};
  const firstName = currentUser.first_name || "User";
  const lastName = currentUser.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const email = currentUser.email || "user@example.com";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  const profilePic = currentUser.profilePic || "";

  // Memoized navigation items
  const navItems = useMemo(
    () => [
      {
        icon: Home,
        label: "Dashboard",
        path: "/dashboard",
        tooltip: "Dashboard",
      },
      {
        icon: CalendarDays,
        label: "Booking History",
        path: "/booking-history",
        tooltip: "Booking History",
      },
      {
        icon: MessageCircle,
        label: "Messages",
        path: "/messages",
        tooltip: "Messages & Chat",
      },
    ],
    []
  );

  // Simple key for Avatar - changes when user data changes
  const avatarKey = `avatar-${firstName}-${lastName}-${profilePic?.slice(
    -10
  )}-${forceUpdateTrigger}`;

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
              {/* Logo - shows when expanded, Menu icon when collapsed */}
              <div className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:bg-red-500 group-data-[collapsible=icon]:rounded-lg flex items-center justify-center transition-all duration-200">
                <img
                  src="/src/assets/WashUpLogo.png"
                  alt="WashUp Logo"
                  className="w-20 h-20 object-contain group-data-[collapsible=icon]:hidden"
                />
                <Menu className="w-4 h-4 text-white hidden group-data-[collapsible=icon]:block" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden text-center">
                <h1 className="text-lg font-black text-red-700 ">
                  BookUp MotMot
                </h1>
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
                  <Avatar key={avatarKey} className="w-8 h-8 shrink-0">
                    <AvatarImage
                      src={profilePic}
                      alt={fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-slate-200 text-slate-700 text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{email}</p>
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
                  <p className="text-xs text-slate-500">{email}</p>
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />
                <Link to="/profile">
                  <DropdownMenuItem className="gap-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="gap-2 text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={logout}
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

export default AppSidebar;
