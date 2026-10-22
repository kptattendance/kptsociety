import { requireAuth, clerkClient } from "@clerk/express";

// userId -> { user, at }. A role change in Clerk takes effect within 5 minutes.
const userCache = new Map();
const USER_CACHE_MS = 5 * 60 * 1000;

const getCachedUser = (userId) => {
  const hit = userCache.get(userId);
  if (hit && Date.now() - hit.at < USER_CACHE_MS) return hit.user;
  userCache.delete(userId);
  return null;
};

export const requireAuthWithRole = (allowedRoles = []) => {
  return [
    requireAuth(), // ensures user is logged in
    async (req, res, next) => {
      try {
        // Get session info safely
        const session =
          req.auth && typeof req.auth === "function" ? req.auth() : null;
        const userId = session?.userId;

        if (!userId) {
          console.warn("No userId found in session:", session);
          return res
            .status(401)
            .json({ error: "Unauthorized. No userId found." });
        }

        // Fetch user info from Clerk (cached briefly – calling Clerk on
        // every request made every page slow)
        let user = getCachedUser(userId);
        if (!user) {
          try {
            const full = await clerkClient.users.getUser(userId);
            user = {
              id: full.id,
              email: full.emailAddresses?.[0]?.emailAddress || null,
              role: full?.publicMetadata?.role || null,
            };
            userCache.set(userId, { user, at: Date.now() });
          } catch (fetchErr) {
            console.error("Failed to fetch user from Clerk:", fetchErr);
            return res
              .status(500)
              .json({ error: "Failed to fetch user info from Clerk" });
          }
        }

        const role = user.role;

        // Check role
        if (allowedRoles.length && !allowedRoles.includes(role)) {
          console.warn("User role not allowed:", role);
          return res
            .status(403)
            .json({ error: "Forbidden: Role not allowed", roleReceived: role });
        }

        // Attach user to request
        req.user = user;

        next();
      } catch (err) {
        console.error("Auth Middleware Error:", err);
        return res.status(401).json({ error: "Unauthorized request" });
      }
    },
  ];
};
