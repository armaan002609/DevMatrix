import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectToDatabase } from "./lib/db";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/events.routes";
import memberRoutes from "./routes/members.routes";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Database connection middleware (for serverless caching)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("Database connection failed", err);
    res.status(503).json({ error: "Database unavailable" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin/members", memberRoutes);

// Catch-all route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => console.log("API Server running on port 3000"));
}

export default app;
