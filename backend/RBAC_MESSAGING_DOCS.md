# RBAC Messaging System Documentation

## Overview
This document describes the comprehensive Role-Based Access Control (RBAC) messaging system implemented for the WashUp application. The system supports three user roles: **Customer**, **Staff**, and **Admin** with proper access control and security measures.

## Architecture

### Service Layer Pattern
The messaging system follows a clean service layer architecture:
- **Controllers** handle HTTP requests and responses
- **Services** contain business logic and RBAC validation
- **Middleware** handles authentication and authorization
- **Models** define data structure and database interactions

### Files Structure
```
backend/src/
├── middleware/
│   └── RBACMiddleware.js          # Flexible RBAC middleware factory
├── services/
│   └── MessagingService.js        # Business logic with RBAC integration
├── controllers/
│   └── EnhancedMessagingController.js  # HTTP request handlers
├── routes/
│   └── UnifiedMessagingRoutes.js  # Unified routing with RBAC
└── utils/
    └── SocketManager.js           # Enhanced with RBAC for real-time messaging
```

## Role-Based Access Control

### User Roles
1. **Customer** - Can only access their own conversations and bookings
2. **Staff** - Can access all customer conversations and manage messaging
3. **Admin** - Full access to all messaging features and administrative functions

### Permission Hierarchy
- **Admin** > **Staff** > **Customer**
- Higher roles inherit permissions from lower roles
- Resource ownership is validated for customers

## API Endpoints

All messaging endpoints are unified under `/messaging/` with role-based access:

### Customer Endpoints
- `GET /messaging/conversations` - Get user's conversations
- `GET /messaging/conversations/:id/messages` - Get messages in conversation
- `POST /messaging/conversations/:id/messages` - Send message
- `PATCH /messaging/conversations/:id/read` - Mark messages as read

### Staff Endpoints  
- `GET /messaging/staff/conversations` - Get all conversations for staff
- `GET /messaging/staff/conversations/:id/messages` - Access any conversation
- `POST /messaging/staff/conversations/:id/messages` - Send messages as staff
- `PATCH /messaging/staff/conversations/:id/read` - Mark as read

### Admin Endpoints
- `GET /messaging/admin/conversations` - Get all conversations
- `GET /messaging/admin/conversations/:id/messages` - Full conversation access
- `POST /messaging/admin/conversations/:id/messages` - Send admin messages
- `DELETE /messaging/admin/conversations/:id` - Delete conversations
- `PATCH /messaging/admin/conversations/:id/read` - Admin mark as read

## Security Features

### Authentication
- JWT token verification for all endpoints
- Consistent user data structure across middleware
- Token validation in both HTTP and WebSocket connections

### Authorization
- Role-based middleware protection
- Resource ownership validation for customers
- Hierarchical permission checking
- Conversation participant validation

### Socket Security
- Real-time RBAC validation for message sending
- Role-based room joining (admin_room, staff_room)
- Access control for conversation participation
- Enhanced user data structure in socket connections

## Implementation Details

### RBAC Middleware Factory
```javascript
// Flexible middleware creation
const customerAuth = RBACMiddleware.authorize(['customer']);
const staffAuth = RBACMiddleware.authorize(['staff', 'admin']);
const adminAuth = RBACMiddleware.authorize(['admin']);
```

### Service Layer Benefits
- Centralized business logic
- Consistent RBAC validation
- Better error handling
- Easier testing and maintenance
- Clear separation of concerns

### Enhanced Socket Manager
- RBAC-aware message sending
- Role-based room management
- Conversation access validation
- Standardized user data structure

## Error Handling

### HTTP Errors
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (conversation doesn't exist)
- 500: Internal Server Error (server issues)

### Socket Errors
- Authentication errors for invalid tokens
- Access denied for unauthorized conversation access
- Message sending failures with proper error emission

## Best Practices Implemented

1. **Service Layer Architecture** - Clean separation of concerns
2. **RBAC Middleware Factory** - Flexible and reusable authorization
3. **Consistent Error Handling** - Standardized error responses
4. **Resource Ownership Validation** - Secure access control
5. **Role Hierarchy** - Proper permission inheritance
6. **Real-time Security** - Socket-level access control
7. **Unified Routing** - Single endpoint with role-based access

## Migration from Previous System

### Changes Made
1. **Removed**: Multiple separate messaging routes
2. **Added**: Unified messaging routes with RBAC
3. **Enhanced**: Socket manager with security
4. **Centralized**: Business logic in service layer
5. **Standardized**: User data structure across middleware

### Backwards Compatibility
- API endpoints maintain similar structure
- Response formats remain consistent
- Socket events unchanged for frontend
- Authentication flow preserved

## Performance Considerations

1. **Efficient Database Queries** - Optimized conversation fetching
2. **Role-based Caching** - Future enhancement opportunity
3. **Connection Management** - Enhanced socket user tracking
4. **Memory Optimization** - Proper cleanup on disconnection

## Security Audit

### Implemented Security Measures
✅ JWT token validation  
✅ Role-based access control  
✅ Resource ownership validation  
✅ Conversation participant checking  
✅ Real-time message access control  
✅ Secure socket authentication  
✅ Error message sanitization  

### Future Security Enhancements
- Rate limiting for message sending
- Message content validation and sanitization
- Conversation encryption
- Audit logging for admin actions
- IP-based access restrictions

## Testing Strategy

### Unit Tests (Future Implementation)
- RBAC middleware functionality
- Service layer business logic
- Controller request/response handling
- Socket event validation

### Integration Tests (Future Implementation)
- End-to-end messaging flows
- Role-based access scenarios
- Real-time message delivery
- Error handling pathways

## Monitoring and Logging

### Current Logging
- User authentication events
- Message sending activities
- Connection/disconnection events
- Error occurrences with context

### Recommended Monitoring
- API response times
- Socket connection counts
- Message delivery rates
- Error frequency analysis

## Conclusion

The implemented RBAC messaging system provides:
- **Enterprise-level security** with comprehensive access control
- **Scalable architecture** using service layer patterns
- **Flexible permissions** through RBAC middleware factory
- **Real-time security** with enhanced socket management
- **Maintainable codebase** with clear separation of concerns

This system follows industry best practices and provides a solid foundation for future messaging enhancements while maintaining security and performance standards.
