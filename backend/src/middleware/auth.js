import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Extract token
  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If role is missing from token, fetch from database
    if (!decoded.role) {
      console.warn('Role missing from token, fetching from database for user:', decoded.id);
      const user = await User.findById(decoded.id).select('role');
      if (user && user.role) {
        decoded.role = user.role;
      } else {
        console.error('User not found or role missing in database for user:', decoded.id);
        return res.status(403).json({ message: "User role not found" });
      }
    }

    // Attach user payload to request
    req.user = decoded;

    next(); // Proceed to route handler
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
