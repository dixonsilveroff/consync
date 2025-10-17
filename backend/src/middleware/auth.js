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

    console.log('Auth middleware - decoded token:', decoded);

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
    
    // Normalize user ID - add _id property for compatibility with existing code
    // JWT contains 'id', but most code expects '_id'
    if (decoded.id && !decoded._id) {
      req.user._id = decoded.id;
      console.log('Auth middleware - normalized user ID from', decoded.id, 'to', req.user._id);
    }

    console.log('Auth middleware - final req.user:', req.user);

    next(); // Proceed to route handler
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
