import React from "react";
import { Button } from "@/components/ui/button";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "../hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  Home,
  History,
  User2,
  FileText,
  ChevronRight,
  ChevronUp,
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

const AppSidebar = ({ children }) => {
  const { logout, user } = useAuth();

  // Safe user data access
  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const userEmail = user?.email || "user@bookupmotmot.com";
  const userInitial = firstName.charAt(0).toUpperCase() || "U";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen">
        {/* Adjusted sidebar width - wider when collapsed to fit avatars */}
        <Sidebar
          collapsible="icon"
          className="w-64 sidebar-collapsed:w-24" // Changed from w-20 to w-24
        >
          <SidebarHeader className="flex items-center p-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="size-8">
                  <ChevronRight className="sidebar-collapsed:rotate-180 transition-transform duration-200" />
                </SidebarTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Toggle sidebar</TooltipContent>
            </Tooltip>
            <h1 className="text-lg font-semibold ml-2 hidden sidebar-expanded:block">
              BookUp MotMot
            </h1>
          </SidebarHeader>

          <SidebarContent>
            {/* BookUp MotMot Section */}
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="justify-between px-4">
                    <div className="flex items-center gap-3">
                      {/* Kept original avatar size (w-8 h-8) */}
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <span className="text-sm font-medium">BM</span>
                      </div>

                      <span className="sidebar-collapsed:hidden">
                        BookUp MotMot
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarSeparator className="sidebar-collapsed:mx-auto sidebar-collapsed:w-8 my-2" />

            {/* Dashboard Section */}
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton isActive className="px-4">
                        <Home className="size-4" />
                        <span className="sidebar-collapsed:hidden ml-3">
                          Dashboard
                        </span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="sidebar-collapsed:block hidden"
                    >
                      Dashboard
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarSeparator className="sidebar-collapsed:mx-auto sidebar-collapsed:w-8 my-2" />

            {/* History Section */}
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton className="px-4">
                        <History className="size-4" />
                        <span className="sidebar-collapsed:hidden ml-3">
                          History
                        </span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="sidebar-collapsed:block hidden"
                    >
                      History
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* Sticky Footer with User Info and Dropdown Menu */}
          <SidebarFooter className="sticky bottom-0 bg-background border-t p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 p-1 rounded-md hover:bg-accent cursor-pointer w-full">
                      <Avatar className="size-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name and Email - shown only when expanded */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium truncate">
                            {fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {userEmail}
                          </p>
                        </div>
                      </div>

                      <ChevronUp className="size-4 flex-shrink-0" />
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]"
                    align="start"
                  >
                    <div className="px-2 py-1.5">
                      <p className="font-medium text-sm">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <User2 className="size-4" />
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <FileText className="size-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                      onClick={logout}
                    >
                      <LogOut className="size-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
