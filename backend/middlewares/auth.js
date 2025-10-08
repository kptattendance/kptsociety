import { requireAuth, clerkClient } from "@clerk/express";

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

        // Fetch full user info from Clerk
        let user;
        try {
          user = await clerkClient.users.getUser(userId);
        } catch (fetchErr) {
          console.error("Failed to fetch user from Clerk:", fetchErr);
          return res
            .status(500)
            .json({ error: "Failed to fetch user info from Clerk" });
        }

        const role = user?.publicMetadata?.role || null;

        // Check role
        if (allowedRoles.length && !allowedRoles.includes(role)) {
          console.warn("User role not allowed:", role);
          return res
            .status(403)
            .json({ error: "Forbidden: Role not allowed", roleReceived: role });
        }

        // Attach user to request
        req.user = {
          id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || null,
          role,
        };

        next();
      } catch (err) {
        console.error("Auth Middleware Error:", err);
        return res.status(401).json({ error: "Unauthorized request" });
      }
    },
  ];
};
