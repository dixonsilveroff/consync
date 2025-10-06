import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXP });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// helper to create a random token string (if you want non-JWT refresh token)
// not used here but provided for completeness
export function generateRandomToken(len = 48) {
  return crypto.randomBytes(len).toString("hex");
}
