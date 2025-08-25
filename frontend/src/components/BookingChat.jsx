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
  MessageCircle,
  Send,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import messagingService from "@/services/messagingService";
import { useAuth } from "@/hooks/useAuth";

const BookingChat = ({ booking, isOpen, onClose }) => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const loadConversation = useCallback(async () => {
    if (!booking?._id) return;

    try {
      setLoading(true);
      const response = await messagingService.getBookingConversation(
        booking._id
      );
      const conv = response.data?.conversation;

      if (conv) {
        setConversation(conv);
        await loadMessages(conv._id);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }, [booking?._id]);

  useEffect(() => {
    if (isOpen && booking) {
      loadConversation();
    }
  }, [isOpen, booking, loadConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await messagingService.getMessages(conversationId);
      setMessages(response.data?.messages || []);
      // Mark as read
      await messagingService.markAsRead(conversationId);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    try {
      setSendingMessage(true);
      const response = await messagingService.sendMessage(
        conversation._id,
        newMessage.trim()
      );

      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
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

  const getOtherParticipants = () => {
    if (!conversation?.participants) return [];
    return conversation.participants.filter((p) => p.user?._id !== user?.id);
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Booking Conversation</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[60vh]">
          {/* Booking Info Sidebar */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{format(new Date(booking.date), "PPP")}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{booking.timeSlot}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{booking.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>₱{booking.price}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Service</h4>
                <Badge variant="outline" className="text-xs">
                  {booking.service}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Status</h4>
                <Badge
                  className={`text-xs ${
                    booking.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : booking.status === "in_progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status?.replace("_", " ")}
                </Badge>
              </div>

              {conversation && getOtherParticipants().length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Participants</h4>
                  <div className="space-y-2">
                    {getOtherParticipants().map((participant) => (
                      <div
                        key={participant.user._id}
                        className="flex items-center space-x-2"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {`${participant.user.first_name[0]}${participant.user.last_name[0]}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium">
                            {participant.user.first_name}{" "}
                            {participant.user.last_name}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {participant.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2">
            {loading ? (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading conversation...</p>
                </div>
              </CardContent>
            ) : conversation ? (
              <>
                <CardHeader>
                  <CardTitle className="text-lg">Messages</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px] p-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No messages yet</p>
                          <p className="text-sm text-gray-500">
                            Start the conversation about your booking
                          </p>
                        </div>
                      ) : (
                        messages
                          .filter(
                            (message) =>
                              message && message.sender && message._id
                          )
                          .map((message) => {
                            const isOwn =
                              message.sender?._id?.toString() ===
                              user?.id?.toString();
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
                                      {message.sender?.first_name || "Unknown"}{" "}
                                      {message.sender?.last_name || "User"}
                                    </span>
                                    <span>
                                      {formatMessageTime(message.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <Separator />
                  <div className="p-4">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex space-x-2"
                    >
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message about this booking..."
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
                    No conversation found
                  </h3>
                  <p className="text-gray-600">
                    Start messaging about this booking to create a conversation
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingChat;
