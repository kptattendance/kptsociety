import { requireAuth, clerkClient } from "@clerk/express";

export const requireAuthWithRole = (allowedRoles = []) => {
  return [
    requireAuth(), // ensures user is logged in
    async (req, res, next) => {
      try {
        const session = req.auth(); // session info
        const userId = session.userId;

        if (!userId) {
          return res
            .status(401)
            .json({ error: "Unauthorized. No userId found." });
        }
        // Fetch full user info from Clerk
        const user = await clerkClient.users.getUser(userId);
        const role = user.publicMetadata?.role || null;

        if (allowedRoles.length && !allowedRoles.includes(role)) {
          return res
            .status(403)
            .json({ error: "Forbidden: Role not allowed", roleReceived: role });
        }

        req.user = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
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
