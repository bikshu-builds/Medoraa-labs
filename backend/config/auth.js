const jwt = require("jsonwebtoken");

/**
 * Common Authentication & Authorization Middleware Generator
 *
 * Verifies the JWT token and checks if the user's role is authorized to access the route.
 * Admin role always has access to all routes by default.
 *
 * @param {string[]} allowedRoles - List of roles permitted to access the route.
 *                                  If empty, any valid authenticated user is allowed.
 */
const commonAuth = (allowedRoles = []) => {
  return (req, res, next) => {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization || req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided, authorization denied" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided, authorization denied" });
    }

    try {
      // 2. Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // 3. Security Principle: admin always has full access
      if (req.user.role === "admin") {
        return next();
      }

      // 4. Role Guard: If allowedRoles is specified, verify user has permission
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Role '${req.user.role}' is not authorized to access this resource`
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  };
};

module.exports = { commonAuth };
