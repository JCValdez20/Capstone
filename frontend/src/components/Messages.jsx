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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messagingService.getConversations();
      console.log("🔍 CONVERSATIONS LOADED:", {
        total: response.data?.conversations?.length || 0,
        conversations: response.data?.conversations?.map((conv) => ({
          id: conv._id,
          participants: conv.participants?.map((p) => ({
            userId: p.user?._id,
            userName: `${p.user?.first_name} ${p.user?.last_name}`,
            role: p.roles,
          })),
          title: conv.title,
        })),
      });
      setConversations(response.data?.conversations || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStaffAdminUsers = async () => {
    try {
      const response = await messagingService.getStaffAndAdminUsers();
      setStaffAdminUsers(response.data?.users || []);
    } catch (error) {
      console.error("Error loading staff/admin users:", error);
    }
  };

  const loadMessages = useCallback(
    async (conversationId) => {
      try {
        const response = await messagingService.getMessages(conversationId);
        console.log("Messages response:", response);
        console.log("Messages data:", response.data?.messages);
        console.log("Current user:", user);
        setMessages(response.data?.messages || []);
        // Mark as read
        await messagingService.markAsRead(conversationId);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load messages");
      }
    },
    [user]
  );

  useEffect(() => {
    loadConversations();
    if (isAdmin || isStaff) {
      loadStaffAdminUsers();
    }
  }, [isAdmin, isStaff, loadConversations]);

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
    const token = localStorage.getItem("token");
    console.log("🔍 Messages component socket check:");
    console.log("  Token exists:", !!token);
    console.log("  Socket connected:", socketService.isConnected());

    if (token && !socketService.isConnected()) {
      console.log("🔌 Connecting to Socket.IO from Messages component...");
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
      console.log("👥 Joined conversation room:", selectedConversation._id);

      // Clean up when conversation changes
      return () => {
        socketService.leaveConversation(selectedConversation._id);
        console.log("👋 Left conversation room:", selectedConversation._id);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Listen for new messages from Socket.IO
    const handleNewMessage = (data) => {
      console.log("📩 Received new message via socket:", data);
      if (data.conversationId === selectedConversation?._id) {
        // Add the new message to the current conversation
        setMessages((prev) => {
          // Avoid duplicates
          const messageExists = prev.some(
            (msg) => msg._id === data.message._id
          );
          if (!messageExists) {
            console.log("Adding new message to conversation");
            return [...prev, data.message];
          }
          console.log("Message already exists, skipping");
          return prev;
        });
        setTimeout(scrollToBottom, 100);
      }
      // Refresh conversations list to show latest message
      loadConversations();
    };

    const handleNewMessageFromUser = (data) => {
      console.log("📩 Received new-message from user via socket:", data);
      if (data.conversationId === selectedConversation?._id) {
        // Add the new message to the current conversation
        setMessages((prev) => {
          // Avoid duplicates
          const messageExists = prev.some(
            (msg) => msg._id === data.message._id
          );
          if (!messageExists) {
            console.log("Adding new message from user to conversation");
            return [...prev, data.message];
          }
          console.log("Message from user already exists, skipping");
          return prev;
        });
        setTimeout(scrollToBottom, 100);
      }
      // Refresh conversations list to show latest message
      loadConversations();
    };

    // Listen for both event types that the backend might emit
    socketService.onNewMessage(handleNewMessage);
    socketService.onNewMessageFromUser(handleNewMessageFromUser);

    // Cleanup listeners when component unmounts
    return () => {
      console.log("Cleaning up socket listeners");
      socketService.removeAllListeners();
    };
  }, [selectedConversation, loadConversations]);

  // Fallback: Auto-refresh messages every 5 seconds for real-time feel
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      console.log("Auto-refreshing messages for real-time updates");
      loadMessages(selectedConversation._id);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation, loadMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      await messagingService.sendMessage(
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
      const response = await messagingService.getDirectConversation(
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
                  Select a team member to start a direct conversation:
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

                        // Debug conversation participants
                        console.log("🔍 CONVERSATION DEBUG:", {
                          conversationId: selectedConversation._id,
                          participants: selectedConversation.participants,
                          currentUser: {
                            id: user?.id,
                            _id: user?._id,
                            name: `${user?.first_name} ${user?.last_name}`,
                          },
                          otherParticipant: otherParticipant,
                        });

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
                        // Get user ID - handle different formats
                        const currentUserId = user?.id || user?._id;
                        const senderId = message.sender?._id;

                        // Convert both to strings for comparison
                        const isOwn =
                          currentUserId?.toString() === senderId?.toString();

                        // Get sender name and role for display
                        const senderName = `${
                          message.sender?.first_name || "Unknown"
                        } ${message.sender?.last_name || "User"}`;
                        const senderRole = message.sender?.roles || "customer";

                        // For testing - if same user, differentiate by current user role
                        const isTestingMode = true; // Change to false in production
                        let effectiveRole = senderRole;
                        let effectiveName = senderName;

                        if (isTestingMode && isOwn) {
                          // If it's our own message, use current user's role and name
                          effectiveRole = user?.roles || "customer";
                          effectiveName =
                            user?.first_name && user?.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : senderName;
                        }

                        // Enhanced debugging - show for all messages to identify the issue
                        const messageIndex = messages.indexOf(message);
                        if (messageIndex < 5) {
                          // Debug first 5 messages
                          console.log(`🔍 Message ${messageIndex + 1}:`, {
                            messageId: message._id,
                            currentUser: {
                              id: user?.id,
                              _id: user?._id,
                              finalId: currentUserId,
                              name: `${user?.first_name} ${user?.last_name}`,
                              role: user?.roles,
                            },
                            sender: {
                              id: senderId,
                              name: effectiveName,
                              role: effectiveRole,
                              firstName: message.sender?.first_name,
                              lastName: message.sender?.last_name,
                              fullObject: message.sender,
                            },
                            isOwn: isOwn,
                            content: message.content.substring(0, 50) + "...",
                          });
                        }

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
                                    ? "You"
                                    : effectiveRole === "admin"
                                    ? `Admin: ${
                                        effectiveName.split(" ")[0] || "Unknown"
                                      }`
                                    : effectiveRole === "staff"
                                    ? `Staff: ${
                                        effectiveName.split(" ")[0] || "Unknown"
                                      }`
                                    : `Customer: ${
                                        effectiveName.split(" ")[0] || "Unknown"
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
