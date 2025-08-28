import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Send,
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import messagingService from "@/services/messagingService";
import socketService from "@/services/socketService";
import { useAuth } from "@/hooks/useAuth";

const Messages = () => {
  const { user, isAdmin, isStaff } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [staffAdminUsers, setStaffAdminUsers] = useState([]);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Helper function to get current user context - SIMPLIFIED
  const getCurrentUserContext = useCallback(() => {
    const currentPath = window.location.pathname;

    // SIMPLE: If on admin/staff interface, check for staff first, then admin
    if (currentPath.includes("/admin") || currentPath.includes("/staff")) {
      // Check for staff user first
      const staffUser = JSON.parse(localStorage.getItem("staffUser") || "{}");
      if (staffUser.roles === "staff") {
        return {
          id: staffUser.id || staffUser._id,
          role: "staff",
          name: `${staffUser.first_name} ${staffUser.last_name}`,
          isAdminInterface: true,
        };
      }

      // Then check for admin user
      const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
      if (adminUser.roles === "admin") {
        return {
          id: adminUser.id || adminUser._id,
          role: "admin",
          name: `${adminUser.first_name} ${adminUser.last_name}`,
          isAdminInterface: true,
        };
      }
    } else {
      // Customer interface
      const regularUser = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        id: regularUser.id || regularUser._id,
        role: regularUser.role || "customer",
        name:
          regularUser.name ||
          `${regularUser.first_name} ${regularUser.last_name}`,
        isAdminInterface: false,
      };
    }
  }, []);

  // Get the appropriate messaging service based on user role
  const getMessagingService = useCallback(() => {
    // Now all roles use the unified messaging service
    return messagingService;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Enhanced: For staff, always show admin conversation at the top
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      // DEBUG: Show staff token and staff user
      const staffUser = localStorage.getItem("staffUser");
      const staffToken = localStorage.getItem("staffToken");
      console.log("[DEBUG] staffUser:", staffUser);
      console.log("[DEBUG] staffToken:", staffToken);
      toast("[DEBUG] staffUser: " + staffUser);
      toast("[DEBUG] staffToken: " + (staffToken ? staffToken.substring(0, 12) + "..." : "none"));

      const response = await getMessagingService().getConversations();
      let allConvos = response.data?.conversations || [];

      // If staff, ensure admin conversation is at the top
      if (isStaff) {
        // Find admin user
        let adminUser = null;
        if (staffAdminUsers.length > 0) {
          adminUser = staffAdminUsers.find(u => u.roles === "admin");
        } else {
          // fallback: try to load
          const usersResp = await getMessagingService().getStaffAndAdminUsers();
          adminUser = (usersResp.data?.users || []).find(u => u.roles === "admin");
        }

        let adminConversation = null;
        if (adminUser) {
          // Find direct conversation with admin
          adminConversation = allConvos.find(c => {
            if (!c.participants) return false;
            const roles = c.participants.map(p => p.user?.roles || p.user?.role);
            return roles.includes("admin") && roles.includes("staff") && !c.relatedBooking;
          });

          // If not found, fetch/create it
          if (!adminConversation) {
            const directResp = await getMessagingService().getDirectConversation(adminUser._id);
            if (directResp.data?.conversation) {
              adminConversation = directResp.data.conversation;
              // Add to allConvos if not present
              if (!allConvos.some(c => c._id === adminConversation._id)) {
                allConvos = [adminConversation, ...allConvos];
              }
            }
          }

          // Remove admin conversation from the rest (if present)
          allConvos = allConvos.filter(c => {
            if (!c.participants) return true;
            const roles = c.participants.map(p => p.user?.roles || p.user?.role);
            return !(roles.includes("admin") && roles.includes("staff") && !c.relatedBooking);
          });

          // Place admin conversation at the top
          if (adminConversation) {
            allConvos = [adminConversation, ...allConvos];
          }
        }
      }
      setConversations(allConvos);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [getMessagingService, isStaff, staffAdminUsers]);

  const loadStaffAdminUsers = useCallback(async () => {
    try {
      const response = await getMessagingService().getStaffAndAdminUsers();
      setStaffAdminUsers(response.data?.users || []);
    } catch (error) {
      console.error("Error loading staff/admin users:", error);
    }
  }, [getMessagingService]);

  const loadMessages = useCallback(
    async (conversationId) => {
      try {
        const response = await getMessagingService().getMessages(
          conversationId
        );
        setMessages(response.data?.messages || []);
        // Mark as read
        await getMessagingService().markAsRead(conversationId);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load messages");
      }
    },
    [getMessagingService]
  );

  useEffect(() => {
    loadConversations();
    if (isAdmin || isStaff) {
      loadStaffAdminUsers();
    }
  }, [isAdmin, isStaff, loadConversations, loadStaffAdminUsers]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
    }
  }, [selectedConversation, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO integration for real-time messaging
  useEffect(() => {
    // Ensure socket is connected when component mounts
    const getSocketToken = () => {
      const currentPath = window.location.pathname;
      const adminToken = localStorage.getItem("adminToken");
      const staffToken = localStorage.getItem("staffToken");
      const userToken = localStorage.getItem("token");

      // Admin pages should use admin token
      if (currentPath.includes("/admin")) {
        if (adminToken) return adminToken;
        if (staffToken) return staffToken; // fallback
      }

      // Staff pages should use staff token
      if (currentPath.includes("/staff")) {
        if (staffToken) return staffToken;
        if (adminToken) return adminToken; // fallback
      }

      // Default to normal user token
      return userToken;
    };

    const token = getSocketToken();

    if (token && !socketService.isConnected()) {
      try {
        socketService.connect(token);
      } catch (error) {
        console.error("❌ Socket connection failed:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Join the selected conversation room
    if (selectedConversation && socketService.isConnected()) {
      socketService.joinConversation(selectedConversation._id);

      // Clean up when conversation changes
      return () => {
        socketService.leaveConversation(selectedConversation._id);
      };
    }
  }, [selectedConversation]);

  // Join/leave conversation when selection changes, ensuring socket is connected
  useEffect(() => {
    const joinIfConnected = async () => {
      if (!selectedConversation) return;
      if (!socketService.isConnected()) {
        // Try to connect with role-aware token
        const currentPath = window.location.pathname;
        const adminToken = localStorage.getItem("adminToken");
        const staffToken = localStorage.getItem("staffToken");
        const userToken = localStorage.getItem("token");
        let token = userToken;
        if (currentPath.includes("/admin")) token = adminToken || staffToken || userToken;
        else if (currentPath.includes("/staff")) token = staffToken || adminToken || userToken;
        if (token) socketService.connect(token);
      }

      // Join room after ensuring connection
      if (socketService.isConnected()) {
        socketService.joinConversation(selectedConversation._id);
      }
    };

    joinIfConnected();

    return () => {
      if (selectedConversation && socketService.isConnected()) {
        socketService.leaveConversation(selectedConversation._id);
      }
    };
  }, [selectedConversation]);

  // Global socket listeners - attach once
  useEffect(() => {
    const handleNewMessage = (data) => {
      // Update messages for current conversation
      if (data.conversationId === selectedConversation?._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === data.message._id);
          if (!exists) return [...prev, data.message];
          return prev;
        });
        setTimeout(scrollToBottom, 100);
      }

      // Update conversation list
      setConversations((prevConvos) => {
        let found = false;
        const updated = prevConvos.map((c) =>
          c._id === data.conversationId ? { ...c, lastMessage: data.message } : c
        );
        if (!found && data.conversation) {
          return [data.conversation, ...updated];
        }
        return updated;
      });
    };

    const handleMessagesRead = (data) => {
      // Update unread counts or UI if needed
      setConversations((prev) =>
        prev.map((c) =>
          c._id === data.conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onMessagesRead(handleMessagesRead);

    return () => {
      socketService.removeAllListeners();
    };
  }, [selectedConversation]);

  // Removed auto-refresh - we use Socket.IO for real-time messaging
  // useEffect(() => {
  //   if (!selectedConversation) return;

  //   const interval = setInterval(() => {
  //     loadMessages(selectedConversation._id);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [selectedConversation, loadMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      await getMessagingService().sendMessage(
        selectedConversation._id,
        newMessage.trim()
      );

      // Don't add message locally - it will come via Socket.IO
      // This prevents duplicate messages
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartDirectConversation = async (targetUserId) => {
    try {
      const response = await getMessagingService().getDirectConversation(
        targetUserId
      );
      const conversation = response.data?.conversation;

      if (conversation) {
        // Add to conversations list if not already there
        const existingIndex = conversations.findIndex(
          (c) => c._id === conversation._id
        );
        if (existingIndex === -1) {
          setConversations((prev) => [conversation, ...prev]);
        }
        setSelectedConversation(conversation);
        setIsNewConversationOpen(false);
        toast.success("Conversation started");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return format(date, "HH:mm");
    }
    return format(date, "MMM dd, HH:mm");
  };

  const getConversationTitle = (conversation) => {
    if (conversation.relatedBooking) {
      return `${conversation.relatedBooking.service} - ${format(
        new Date(conversation.relatedBooking.date),
        "MMM dd"
      )}`;
    }
    return conversation.title || "Direct Message";
  };

  const getOtherParticipant = (conversation) => {
    const currentUserId = user?.id || user?._id;
    return conversation.participants?.find(
      (p) => p.user?._id?.toString() !== currentUserId?.toString()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">
            Communicate with customers and team members
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <Dialog
            open={isNewConversationOpen}
            onOpenChange={setIsNewConversationOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {(() => {
                    const currentContext = getCurrentUserContext();
                    if (currentContext.role === "admin") {
                      return "Select a staff member to start a conversation:";
                    } else if (currentContext.role === "staff") {
                      return "Select a team member or customer to start a conversation:";
                    } else {
                      return "Select a team member to start a direct conversation:";
                    }
                  })()}
                </p>
                <div className="space-y-2">
                  {staffAdminUsers.map((staffUser) => (
                    <div
                      key={staffUser._id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {`${staffUser.first_name[0]}${staffUser.last_name[0]}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {staffUser.first_name} {staffUser.last_name}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            {staffUser.roles === "admin" ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            <span className="capitalize">
                              {staffUser.roles}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStartDirectConversation(staffUser._id)
                        }
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Conversations ({conversations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-sm text-gray-500">
                    Start messaging about bookings or with team members
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation);
                    const isSelected =
                      selectedConversation?._id === conversation._id;

                    return (
                      <div
                        key={conversation._id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-red-50 border border-red-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {otherParticipant?.user
                                ? `${otherParticipant.user.first_name[0]}${otherParticipant.user.last_name[0]}`
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {getConversationTitle(conversation)}
                              </p>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(
                                    conversation.lastMessage.timestamp
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  otherParticipant?.roles === "admin"
                                    ? "bg-purple-100 text-purple-700"
                                    : otherParticipant?.roles === "staff"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {otherParticipant?.roles || "Customer"}
                              </Badge>
                              {conversation.relatedBooking && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Booking
                                </Badge>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {(() => {
                        const otherParticipant =
                          getOtherParticipant(selectedConversation);
                        return otherParticipant?.user
                          ? `${otherParticipant.user.first_name[0]}${otherParticipant.user.last_name[0]}`
                          : "?";
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {getConversationTitle(selectedConversation)}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {(() => {
                        const otherParticipant =
                          getOtherParticipant(selectedConversation);

                        return (
                          <>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                (otherParticipant?.user?.roles ||
                                  otherParticipant?.role) === "admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : (otherParticipant?.user?.roles ||
                                      otherParticipant?.role) === "staff"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {otherParticipant?.user
                                ? `${
                                    otherParticipant.user.first_name ||
                                    "Unknown"
                                  } ${
                                    otherParticipant.user.last_name || "User"
                                  } (${
                                    otherParticipant.user.roles ||
                                    otherParticipant.role ||
                                    "User"
                                  })`
                                : selectedConversation?.relatedBooking?.user
                                ? "Booking Customer"
                                : "Conversation Participant"}
                            </Badge>
                            {selectedConversation.relatedBooking && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {selectedConversation.relatedBooking.service}
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <ScrollArea className="h-[350px] p-4">
                  <div className="space-y-4">
                    {messages
                      .filter(
                        (message) => message && message.sender && message._id
                      )
                      .map((message) => {
                        // Get current user context (handles both customer and admin interfaces)
                        const currentContext = getCurrentUserContext();
                        const currentUserId = currentContext.id;
                        const senderId =
                          message.sender?._id || message.sender?.id;

                        // Convert both to strings for comparison
                        const isOwn =
                          currentUserId?.toString() === senderId?.toString();

                        // For better UX, also check if this message was sent in the same role context
                        // as the current user session (helps with multi-role scenarios)
                        const currentUserRole = currentContext.role;
                        const messageFromSameRoleContext =
                          isOwn && message.senderRole === currentUserRole;

                        // Debug logging
                        if (isOwn) {
                          console.log("Debug - Own message detected:", {
                            currentUserRole,
                            messageSenderRole: message.senderRole,
                            messageFromSameRoleContext,
                            isOwn,
                          });
                        }

                        // Get sender info
                        const senderName = `${
                          message.sender?.first_name || "Unknown"
                        } ${message.sender?.last_name || "User"}`;

                        // Use senderRole from the message (role when message was sent)
                        // instead of sender's current role to handle multi-role users
                        const senderRole =
                          message.senderRole ||
                          message.sender?.roles ||
                          message.sender?.role ||
                          "customer";

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={`flex items-center justify-between mt-1 text-xs ${
                                  isOwn ? "text-red-100" : "text-gray-500"
                                }`}
                              >
                                <span>
                                  {isOwn
                                    ? messageFromSameRoleContext
                                      ? `You (${senderRole})`
                                      : `You as ${senderRole}`
                                    : senderRole === "admin"
                                    ? `Admin: ${
                                        senderName.split(" ")[0] || "Unknown"
                                      }`
                                    : senderRole === "staff"
                                    ? `Staff: ${
                                        senderName.split(" ")[0] || "Unknown"
                                      }`
                                    : `Customer: ${
                                        senderName.split(" ")[0] || "Unknown"
                                      }`}
                                </span>
                                <span>
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <Separator />
                <div className="p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
