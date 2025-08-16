# Real-Time Messaging System Documentation

## Overview

This messaging system enables real-time communication between customers and admins regarding bookings. It features WebSocket support, conversation management, message tracking, and read receipts.

## Backend Architecture

### Models

#### Conversation Model (`/models/Conversation.js`)

- **Purpose**: Manages conversations between users and admins
- **Key Features**:
  - Participant management with roles (customer/admin)
  - Related booking connections
  - Unread message counts per user
  - Last message preview
  - Status tracking (active/archived/closed)

#### Messages Model (`/models/Messages.js`)

- **Purpose**: Stores individual messages within conversations
- **Key Features**:
  - Message content with 2000 character limit
  - Message types (text/image/file/system)
  - Attachment support
  - Read receipts tracking
  - Reply functionality
  - Soft delete capability
  - Edit tracking with timestamps

### Controllers

#### MessagingController (`/controllers/MessagingController.js`)

- **Endpoints**:
  - `GET /messaging/conversations` - Get user's conversations
  - `GET /messaging/conversations/booking/:bookingId` - Get/create conversation for booking
  - `GET /messaging/conversations/:conversationId/messages` - Get messages in conversation
  - `POST /messaging/conversations/:conversationId/messages` - Send a message
  - `PUT /messaging/conversations/:conversationId/read` - Mark conversation as read
  - `GET /messaging/stats` - Get messaging statistics (admin only)

### WebSocket Manager

#### SocketManager (`/utils/SocketManager.js`)

- **Features**:
  - JWT-based authentication middleware
  - User connection mapping
  - Room management (user rooms, conversation rooms, admin room)
  - Real-time message broadcasting
  - Typing indicators
  - Online/offline status tracking
  - Read receipt management

#### Socket Events

- **Connection Events**: `connection`, `disconnect`, `authenticate`
- **Message Events**: `new_message`, `message_sent`, `messages_read`
- **Conversation Events**: `join_conversation`, `leave_conversation`, `conversation_updated`
- **Typing Events**: `typing_start`, `typing_stop`, `user_typing`
- **Admin Events**: `admin_broadcast`, `user_online`, `user_offline`

### API Endpoints

#### Authentication Required

All messaging endpoints require authentication via JWT token in the Authorization header.

#### Messaging Routes (`/routes/MessagingRoutes.js`)

1. **Get Conversations**

   ```
   GET /messaging/conversations?status=active&page=1&limit=20
   ```

   - Returns user's conversations with unread counts and online status

2. **Get/Create Conversation for Booking**

   ```
   GET /messaging/conversations/booking/:bookingId
   ```

   - Creates conversation if it doesn't exist
   - Associates conversation with specific booking

3. **Get Messages**

   ```
   GET /messaging/conversations/:conversationId/messages?page=1&limit=50
   ```

   - Returns messages in chronological order
   - Automatically marks messages as read

4. **Send Message**

   ```
   POST /messaging/conversations/:conversationId/messages
   Body: {
     "content": "Message content",
     "messageType": "text",
     "replyTo": "messageId" // optional
   }
   ```

   - Sends real-time message via WebSocket
   - Updates conversation's last message
   - Increments unread counts for other participants

5. **Mark as Read**

   ```
   PUT /messaging/conversations/:conversationId/read
   ```

   - Marks all messages in conversation as read
   - Resets unread count for user

6. **Get Statistics** (Admin Only)
   ```
   GET /messaging/stats
   ```
   - Returns total conversations, messages, and online users

### Test Endpoints (`/routes/TestRoutes.js`)

1. **Test Messaging System**

   ```
   POST /test/test-messaging
   ```

   - Creates sample conversation and message
   - Useful for development and testing

2. **Socket Status**
   ```
   GET /test/socket-status
   ```
   - Returns Socket.IO initialization status and online users

## Database Schema

### Conversations Collection

```javascript
{
  _id: ObjectId,
  participants: [
    {
      user: ObjectId, // Reference to User
      role: String,   // 'customer' or 'admin'
      joinedAt: Date,
      lastSeen: Date
    }
  ],
  relatedBooking: ObjectId, // Reference to Booking
  title: String,
  lastMessage: {
    content: String,
    sender: ObjectId,
    messageType: String,
    timestamp: Date
  },
  unreadCounts: Map, // userId -> count
  status: String,    // 'active', 'archived', 'closed'
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection

```javascript
{
  _id: ObjectId,
  conversation: ObjectId, // Reference to Conversation
  sender: ObjectId,       // Reference to User
  content: String,        // Max 2000 characters
  messageType: String,    // 'text', 'image', 'file', 'system'
  attachments: [
    {
      url: String,
      filename: String,
      mimetype: String,
      size: Number
    }
  ],
  readBy: [
    {
      user: ObjectId,
      readAt: Date
    }
  ],
  replyTo: ObjectId,     // Reference to another Message
  reactions: [
    {
      user: ObjectId,
      emoji: String,
      createdAt: Date
    }
  ],
  isDeleted: Boolean,
  deletedAt: Date,
  isEdited: Boolean,
  editedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## WebSocket Integration

### Server Setup

```javascript
// server.js
const { Server } = require("socket.io");
const socketManager = require("./utils/SocketManager");

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketManager.initialize(io);
```

### Client Connection (Frontend Implementation Guide)

```javascript
// Frontend Socket.IO client setup
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: localStorage.getItem("token"), // JWT token
  },
});

// Listen for events
socket.on("new_message", (data) => {
  // Handle new message
});

socket.on("user_typing", (data) => {
  // Handle typing indicator
});

socket.on("conversation_updated", (data) => {
  // Handle conversation updates
});
```

## Development Status

### ✅ Completed Backend Features

- [x] Conversation and Messages models
- [x] WebSocket infrastructure with Socket.IO
- [x] JWT-based authentication for WebSocket
- [x] Real-time message broadcasting
- [x] Typing indicators
- [x] Read receipts
- [x] Online/offline status tracking
- [x] Message pagination
- [x] Conversation management
- [x] Admin statistics endpoint
- [x] Test endpoints for development

### 🔄 Next Steps (Frontend Integration)

- [ ] React components for chat interface
- [ ] Socket.IO client integration
- [ ] Message list component
- [ ] Conversation list component
- [ ] Typing indicators UI
- [ ] File upload functionality
- [ ] Notification system
- [ ] Mobile-responsive design

## Installation & Setup

1. **Install Dependencies**

   ```bash
   cd backend
   npm install socket.io
   ```

2. **Environment Variables**
   Add to `.env` file:

   ```
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your-jwt-secret
   ```

3. **Start Server**

   ```bash
   npm start
   ```

4. **Test the System**

   ```bash
   # Test messaging system
   POST http://localhost:3000/test/test-messaging

   # Check socket status
   GET http://localhost:3000/test/socket-status
   ```

## API Response Format

All API responses follow this format:

```javascript
{
  success: boolean,
  message: string,
  data: object, // Response data
  error?: string // Only present on errors
}
```

## Error Handling

- **401**: Authentication required
- **403**: Access denied (not participant in conversation)
- **404**: Conversation/message not found
- **400**: Validation errors (empty message content, etc.)
- **500**: Server errors

## Security Features

- JWT-based authentication for both HTTP and WebSocket
- User permission validation for conversation access
- Message content validation and sanitization
- Rate limiting support (can be added)
- CORS configuration for WebSocket connections

## Performance Considerations

- Message pagination to prevent large data loads
- Efficient database indexes on frequently queried fields
- Connection pooling for WebSocket management
- Unread count optimization using MongoDB Maps
- Background cleanup for deleted messages (can be implemented)

## Future Enhancements

- File and image uploads
- Message reactions and emoji support
- Push notifications
- Message search functionality
- Conversation archiving
- Admin broadcast messages
- Message encryption
- Voice messages
- Video calling integration
