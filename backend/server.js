import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import memberRoutes from "./routes/memberRoutes.js"; // fixed path
import loanRoutes from "./routes/loanRoutes.js"; // fixed path
import fdRoutes from "./routes/fdRoutes.js"; // fixed path
import rdRoutes from "./routes/rdRoutes.js"; // fixed path
import adminRoutes from "./routes/adminRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import cdRoutes from "./routes/cdRoutes.js";

const app = express();
dotenv.config();
app.disable("x-powered-by");

// Optional: CORS_ORIGINS="https://www.kptsociety.in,https://kptsociety.in"
// limits which websites may call this API. Unset = allow all (auth still required).
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors(
    allowedOrigins.length
      ? { origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)) }
      : undefined,
  ),
);
app.use(express.json({ limit: "1mb" }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/members", memberRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/fd", fdRoutes);
app.use("/api/rd", rdRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/cd", cdRoutes);
app.get("/", (req, res) => {
  res.send("KPT Society Backend Running");
});

// Upload / unexpected errors → JSON instead of an HTML stack trace
app.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE")
    return res.status(413).json({ message: "File is too large (max 5 MB)" });
  if (err?.message === "Only image files are allowed")
    return res.status(400).json({ message: err.message });
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
