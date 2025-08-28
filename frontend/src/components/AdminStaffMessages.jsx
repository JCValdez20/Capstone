import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Users, User, Clock, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import messagingService from "@/services/messagingService";

const AdminStaffMessages = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadStaffList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messagingService.getStaffList();
      setStaffList(response.data?.staffMembers || []);
    } catch (error) {
      console.error("Error loading staff list:", error);
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  }, []);

  const startConversationWithStaff = async (staffMember) => {
    try {
      const response = await messagingService.createDirectConversation(
        staffMember._id
      );
      const conversation = response.data?.conversation;

      if (conversation) {
        // Select this conversation and load messages
        setSelectedConversation(conversation);
        loadMessages(conversation._id);
      }

      toast.success(
        `Started conversation with ${staffMember.first_name} ${staffMember.last_name}`
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const response = await messagingService.getMessages(conversationId);
      setMessages(response.data?.messages || []);

      // Mark as read
      await messagingService.markAsRead(conversationId);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await messagingService.sendMessage(
        selectedConversation._id,
        newMessage.trim()
      );

      const message = response.data?.message;
      if (message) {
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredStaff = staffList.filter((staff) =>
    `${staff.first_name} ${staff.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadStaffList();
  }, [loadStaffList]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
    }
  }, [selectedConversation, loadMessages]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar - Staff List & Conversations */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Messages
          </CardTitle>
        </CardHeader>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* Staff List */}
          <div className="px-4 pb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Available Staff
            </h3>
            <div className="space-y-2">
              {loading ? (
                <div className="text-sm text-gray-500">Loading staff...</div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-sm text-gray-500">No staff found</div>
              ) : (
                filteredStaff.map((staff) => (
                  <div
                    key={staff._id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => startConversationWithStaff(staff)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {staff.first_name?.[0]}
                        {staff.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {staff.first_name} {staff.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{staff.email}</p>
                    </div>
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Side - Messages */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="border-b bg-white p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {(() => {
                      const staffUser = selectedConversation.participants?.find(
                        (p) => p.role === "staff"
                      )?.user;
                      return `${staffUser?.first_name?.[0] || ""}${
                        staffUser?.last_name?.[0] || ""
                      }`;
                    })()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {(() => {
                      const staffUser = selectedConversation.participants?.find(
                        (p) => p.role === "staff"
                      )?.user;
                      return `${staffUser?.first_name || ""} ${
                        staffUser?.last_name || ""
                      }`;
                    })()}
                  </h3>
                  <p className="text-sm text-gray-500">Staff Member</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const adminUser = JSON.parse(
                    localStorage.getItem("adminUser") || "{}"
                  );
                  const isCurrentUser = message.sender?._id === adminUser.id;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {format(new Date(message.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select a staff member to message
              </h3>
              <p className="text-gray-500">
                Choose a staff member from the list to start a conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStaffMessages;
