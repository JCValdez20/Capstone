// Socket.IO Event Types
const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  ERROR: "error",

  // Authentication events
  AUTHENTICATE: "authenticate",
  AUTHENTICATED: "authenticated",
  AUTHENTICATION_ERROR: "authentication_error",

  // Conversation events
  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",
  CONVERSATION_JOINED: "conversation_joined",
  CONVERSATION_LEFT: "conversation_left",
  CONVERSATION_UPDATED: "conversation_updated",

  // Message events
  NEW_MESSAGE: "new_message",
  MESSAGE_SENT: "message_sent",
  MESSAGE_DELETED: "message_deleted",
  MESSAGE_EDITED: "message_edited",
  MESSAGES_READ: "messages_read",

  // Typing events
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  USER_TYPING: "user_typing",

  // Admin events
  ADMIN_BROADCAST: "admin_broadcast",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",

  // Error events
  VALIDATION_ERROR: "validation_error",
  PERMISSION_ERROR: "permission_error",
};

// Room naming conventions
const ROOM_TYPES = {
  CONVERSATION: (conversationId) => `conversation_${conversationId}`,
  USER: (userId) => `user_${userId}`,
  ADMIN: "admins",
};

// Message status types
const MESSAGE_STATUS = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  DELETED: "deleted",
  EDITED: "edited",
};

// Conversation status types
const CONVERSATION_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  CLOSED: "closed",
};

module.exports = {
  SOCKET_EVENTS,
  ROOM_TYPES,
  MESSAGE_STATUS,
  CONVERSATION_STATUS,
};
