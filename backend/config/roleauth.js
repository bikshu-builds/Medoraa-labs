const { commonAuth } = require("./auth");

const roleAuth = {
  // ── Predefined Roles Single-role access ─────────────────────────────────────
  admin: commonAuth(["admin"]),
  registration: commonAuth(["registration"]),
  authorization: commonAuth(["authorization"]),
  inventory: commonAuth(["inventory"]),

  // ── Broad access (ANY authenticated employee) ────────────────────────────────
  // Passing an empty roles array [] means: token is valid → user is allowed.
  // This covers ALL roles dynamically without needing to enumerate every possible role string.
  any: commonAuth([]),
  user: commonAuth([]),
  full: commonAuth([]),
  employee: commonAuth([]),
};

// ── Functional helpers ────────────────────────────────────────────────────────
// authenticate: verifies JWT only, no role restriction
const authenticate = commonAuth([]);

// authorize(['finance', 'admin']): inline role guard for one-off cases
// Roles come from req.user.role (trusted JWT payload only).
const authorize = (roles) => commonAuth(Array.isArray(roles) ? roles : [roles]);

module.exports = { ...roleAuth, authenticate, authorize };
