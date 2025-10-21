import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173", // Local development
  "https://consync.app", // Production domain
  "https://www.consync.app" // Production with www
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow Vercel preview/production deployments
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(cookieParser());

// health
app.get("/", (req, res) => res.send("ConSync Backend Running ✅"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

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
