import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import memberRoutes from "./routes/memberRoutes.js"; // fixed path
import loanRoutes from "./routes/loanRoutes.js"; // fixed path
import fdRoutes from "./routes/fdRoutes.js"; // fixed path
import rdRoutes from "./routes/rdRoutes.js"; // fixed path
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/members", memberRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/fd", fdRoutes);
app.use("/api/rd", rdRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("KPT Society Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
