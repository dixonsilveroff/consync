import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// health
app.get("/", (req, res) => res.send("ConSync Backend Running ✅"));

// routes
app.use("/api/auth", authRoutes);

// generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

(async () => {
  if (process.env.MONGO_URI) await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
