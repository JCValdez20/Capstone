import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChatStore } from "@/store/useChatStore";
import socketService from "@/services/socketService";
import { Search, Send, Users, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const CustomerMessages = () => {
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { user } = useAuth();

  const {
    messages,
    users,
    selectedUser,
    isUsersLoading,
    isMessagesLoading,
    isSendingMessage,
    getUsers,
    sendMessage,
    setSelectedUser,
  } = useChatStore();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket and fetch users on component mount
  useEffect(() => {
    // Connect socket with token
    const token = localStorage.getItem("accessToken");
    if (token) {
      socketService.connect();
    }
    getUsers();

    return () => {
      // Don't disconnect socket on unmount - keep it for real-time updates
    };
  }, [getUsers]);

  // Handle user selection
  const handleUserSelect = async (selectedStaff) => {
    console.log("📋 Selecting user:", selectedStaff);
    await setSelectedUser(selectedStaff);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove image preview
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !imagePreview) {
      toast.error("Please enter a message or select an image");
      return;
    }

    if (!selectedUser) {
      toast.error("Please select a user to message");
      return;
    }

    try {
      await sendMessage({
        text: newMessage.trim(),
        image: imagePreview,
      });

      // Clear form
      setNewMessage("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Filter users based on search query and exclude admin users
  const filteredUsers = users.filter((staff) => {
    const roles = Array.isArray(staff.roles) ? staff.roles : [staff.roles];
    const isNotAdmin = !roles.includes('admin');
    const matchesSearch = `${staff.first_name} ${staff.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return isNotAdmin && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Users Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Messages</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {isUsersLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No staff members available
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredUsers.map((staff) => {
                const isSelected = selectedUser?._id === staff._id;

                return (
                  <button
                    key={staff._id}
                    onClick={() => handleUserSelect(staff)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={staff.profilePic} />
                        <AvatarFallback>
                          {`${staff.first_name?.[0] || ""}${
                            staff.last_name?.[0] || ""
                          }`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {staff.first_name} {staff.last_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={(() => {
                              const roles = Array.isArray(staff.roles)
                                ? staff.roles
                                : [staff.roles];
                              return roles.includes("admin")
                                ? "default"
                                : "secondary";
                            })()}
                            className="text-xs"
                          >
                            {Array.isArray(staff.roles)
                              ? staff.roles.join(", ")
                              : staff.roles}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.profilePic} />
                  <AvatarFallback>
                    {`${selectedUser.first_name?.[0] || ""}${
                      selectedUser.last_name?.[0] || ""
                    }`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={(() => {
                        const roles = Array.isArray(selectedUser.roles)
                          ? selectedUser.roles
                          : [selectedUser.roles];
                        return roles.includes("admin")
                          ? "default"
                          : "secondary";
                      })()}
                    >
                      {Array.isArray(selectedUser.roles)
                        ? selectedUser.roles.join(", ")
                        : selectedUser.roles}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {selectedUser.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isMessagesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-16 w-64" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === user.id;

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
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Attachment"
                            className="max-w-full h-auto rounded-md mb-2"
                          />
                        )}
                        {message.text && (
                          <p className="text-sm whitespace-pre-wrap">
                            {message.text}
                          </p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2"
              >
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className={imagePreview ? "text-blue-600" : "text-gray-400"}
                  >
                    <Image className="h-4 w-4" />
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      (!newMessage.trim() && !imagePreview) || isSendingMessage
                    }
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a staff member
              </h3>
              <p className="text-gray-500">
                Choose a staff member from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMessages;
