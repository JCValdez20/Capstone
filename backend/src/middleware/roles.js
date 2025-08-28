const { sendErrorMessage } = require("../utils/Response");
const Auth = require("./auth");

/**
 * Role-based Authorization Middleware
 * Handles role permissions and access control
 */
class Roles {
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
      ownershipField = "userId",
      strict = true,
    } = options;

    return async (req, res, next) => {
      try {
        // First authenticate the user
        await new Promise((resolve, reject) => {
          Auth.authenticate()(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Role-based authorization
        const userRole = req.userData.roles || req.userData.role; // Check both 'roles' and 'role'
        const hasPermission = this.checkRolePermission(userRole, roles, strict);
        if (!hasPermission) {
          return sendErrorMessage(
            res,
            403,
            new Error(`Access denied. Required roles: ${roles.join(", ")}`)
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
          if (!ownsResource && req.userData.role !== "admin") {
            return sendErrorMessage(
              res,
              403,
              new Error("Access denied. Resource ownership required")
            );
          }
        }

        next();
      } catch (error) {
        console.error("Role Authorization Error:", error);
        return sendErrorMessage(res, 403, new Error("Authorization failed"));
      }
    };
  }

  /**
   * Convenience methods for common role combinations
   */
  static customer() {
    return this.authorize(["customer"]);
  }

  static staff() {
    return this.authorize(["staff"]);
  }

  static admin() {
    return this.authorize(["admin"]);
  }

  static staffOrAdmin() {
    return this.authorize(["staff", "admin"]);
  }

  static anyAuth() {
    return this.authorize(["customer", "staff", "admin"]);
  }

  /**
   * Legacy compatibility methods (to replace old middleware)
   */
  static userGuard() {
    return this.anyAuth(); // User-Guard allowed any authenticated user
  }

  static adminAuth() {
    return this.admin();
  }

  static staffAuth() {
    return this.staff();
  }

  static adminStaffAuth() {
    return this.staffOrAdmin();
  }

  /**
   * Check if user role has permission
   * @param {string} userRole - User's role
   * @param {string[]} allowedRoles - Array of allowed roles
   * @param {boolean} strict - Strict mode (no hierarchical permissions)
   * @returns {boolean} Permission status
   */
  static checkRolePermission(userRole, allowedRoles, strict = true) {
    if (!userRole || !allowedRoles.length) return false;

    // Direct role match
    if (allowedRoles.includes(userRole)) return true;

    // Hierarchical permissions (if not strict mode)
    if (!strict) {
      const roleHierarchy = {
        admin: ["admin", "staff", "customer"],
        staff: ["staff", "customer"],
        customer: ["customer"],
      };

      const userPermissions = roleHierarchy[userRole] || [];
      return allowedRoles.some((role) => userPermissions.includes(role));
    }

    return false;
  }

  /**
   * Check resource ownership
   * @param {Object} req - Express request object
   * @param {string} ownershipField - Field to check ownership against
   * @param {string} userId - User ID to check ownership for
   * @returns {Promise<boolean>} Ownership status
   */
  static async checkResourceOwnership(req, ownershipField, userId) {
    // Extract resource ID from params
    const resourceId =
      req.params.id || req.params.bookingId || req.params.conversationId;

    if (!resourceId) return true; // Skip check if no resource ID

    // This would typically query the database to check ownership
    // For now, we'll use a simple field comparison
    return (
      req.body[ownershipField] === userId ||
      req.params[ownershipField] === userId
    );
  }

  /**
   * Permission constants for easy reference
   */
  static get ROLES() {
    return {
      ADMIN: "admin",
      STAFF: "staff",
      CUSTOMER: "customer",
    };
  }

  static get PERMISSIONS() {
    return {
      // Messaging permissions
      READ_ALL_CONVERSATIONS: ["admin"],
      READ_OWN_CONVERSATIONS: ["admin", "staff", "customer"],
      SEND_MESSAGES: ["admin", "staff", "customer"],
      DELETE_MESSAGES: ["admin"],
      MODERATE_CONVERSATIONS: ["admin", "staff"],

      // Admin permissions
      MANAGE_USERS: ["admin"],
      VIEW_SYSTEM_STATS: ["admin"],
      MANAGE_BOOKINGS: ["admin", "staff"],

      // Staff permissions
      MANAGE_CUSTOMER_BOOKINGS: ["admin", "staff"],
      VIEW_CUSTOMER_MESSAGES: ["admin", "staff"],
    };
  }
}

module.exports = Roles;
