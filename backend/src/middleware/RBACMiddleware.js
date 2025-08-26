const jwt = require("jsonwebtoken");
const { sendErrorMessage } = require("../utils/Response");

/**
 * Enhanced RBAC Middleware Factory
 * Creates role-based access control middleware with flexible permissions
 */
class RBACMiddleware {
  /**
   * Create middleware for specific roles
   * @param {string|string[]} allowedRoles - Single role or array of allowed roles
   * @param {Object} options - Additional options
   * @returns {Function} Express middleware
   */
  static authorize(allowedRoles, options = {}) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const { 
      requireOwnership = false, 
      ownershipField = 'userId',
      strict = true 
    } = options;

    return async (req, res, next) => {
      try {
        // Extract and validate token
        const token = this.extractToken(req);
        if (!token) {
          return sendErrorMessage(res, 401, new Error("Authentication required"));
        }

        // Verify and decode token
        const decoded = this.verifyToken(token);
        if (!decoded) {
          return sendErrorMessage(res, 401, new Error("Invalid or expired token"));
        }

        // Standardize user data across all middleware
        req.userData = this.standardizeUserData(decoded);

        // Role-based authorization
        const hasPermission = this.checkRolePermission(req.userData.role, roles, strict);
        if (!hasPermission) {
          console.log("❌ RBAC Access Denied:", {
            userRole: req.userData.role,
            requiredRoles: roles,
            userId: req.userData.id
          });
          return sendErrorMessage(
            res, 
            403, 
            new Error(`Access denied. Required roles: ${roles.join(', ')}`)
          );
        }

        // Resource ownership check (if required)
        if (requireOwnership) {
          const ownsResource = await this.checkResourceOwnership(
            req, 
            ownershipField, 
            req.userData.id
          );
          
          // Admin bypass ownership check
          if (!ownsResource && req.userData.role !== 'admin') {
            return sendErrorMessage(
              res, 
              403, 
              new Error("Access denied. Resource ownership required")
            );
          }
        }

        next();
      } catch (error) {
        console.error("RBAC Authorization Error:", error);
        return sendErrorMessage(res, 401, new Error("Authentication failed"));
      }
    };
  }

  /**
   * Extract JWT token from request headers
   */
  static extractToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.split(" ")[1];
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Standardize user data format across all middleware
   */
  static standardizeUserData(decoded) {
    // More robust role detection
    const userRole = decoded.roles || decoded.role || 'customer'; // Default to customer
    
    return {
      id: decoded.id || decoded.userId,
      userId: decoded.id || decoded.userId,
      email: decoded.email,
      roles: userRole,
      role: userRole,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
    };
  }

  /**
   * Check if user role has permission
   */
  static checkRolePermission(userRole, allowedRoles, strict = true) {
    if (!userRole || !allowedRoles.length) return false;

    // Direct role match
    if (allowedRoles.includes(userRole)) return true;

    // Hierarchical permissions (if not strict mode)
    if (!strict) {
      const roleHierarchy = {
        admin: ['admin', 'staff', 'customer'],
        staff: ['staff', 'customer'],
        customer: ['customer']
      };

      const userPermissions = roleHierarchy[userRole] || [];
      return allowedRoles.some(role => userPermissions.includes(role));
    }

    return false;
  }

  /**
   * Check resource ownership
   */
  static async checkResourceOwnership(req, ownershipField, userId) {
    // Extract resource ID from params
    const resourceId = req.params.id || req.params.bookingId || req.params.conversationId;
    
    if (!resourceId) return true; // Skip check if no resource ID

    // This would typically query the database to check ownership
    // For now, we'll use a simple field comparison
    return req.body[ownershipField] === userId || req.params[ownershipField] === userId;
  }

  /**
   * Permission constants for easy reference
   */
  static get ROLES() {
    return {
      ADMIN: 'admin',
      STAFF: 'staff', 
      CUSTOMER: 'customer'
    };
  }

  static get PERMISSIONS() {
    return {
      // Messaging permissions
      READ_ALL_CONVERSATIONS: ['admin'],
      READ_OWN_CONVERSATIONS: ['admin', 'staff', 'customer'],
      SEND_MESSAGES: ['admin', 'staff', 'customer'],
      DELETE_MESSAGES: ['admin'],
      MODERATE_CONVERSATIONS: ['admin', 'staff'],
      
      // Admin permissions
      MANAGE_USERS: ['admin'],
      VIEW_SYSTEM_STATS: ['admin'],
      MANAGE_BOOKINGS: ['admin', 'staff'],
      
      // Staff permissions
      MANAGE_CUSTOMER_BOOKINGS: ['admin', 'staff'],
      VIEW_CUSTOMER_MESSAGES: ['admin', 'staff']
    };
  }
}

module.exports = RBACMiddleware;
