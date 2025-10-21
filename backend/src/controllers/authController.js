import User from "../models/User.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

const COOKIE_NAME = "consync_rt"; // refresh token cookie name

async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await User.hashPassword(password);
    // Set new users as admin by default
    const user = new User({ name, email, passwordHash, phone, role: 'admin' });
    await user.save();

    // generate tokens
    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    // store hashed refresh token
    const rtHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokenHash = rtHash;
    await user.save();

    // set httpOnly cookie
    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('Login failed: missing credentials', { email: !!email, password: !!password });
      return res.status(400).json({ message: "email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: user not found', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    const rtHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokenHash = rtHash;
    await user.save();

    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: { id: user._id, name: user.name, role: user.role, email: user.email },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "No refresh token" });

    // verify signature
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // compare stored hash
    const matches = user.refreshTokenHash ? await bcrypt.compare(token, user.refreshTokenHash) : false;
    if (!matches) {
      // possible reuse/attack: clear token on user
      user.refreshTokenHash = null;
      await user.save();
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // rotate refresh token: issue new refresh + access, store new hash
    const newAccess = signAccessToken({ id: user._id, role: user.role });
    const newRefresh = signRefreshToken({ id: user._id });
    user.refreshTokenHash = await bcrypt.hash(newRefresh, 12);
    await user.save();

    res.cookie(COOKIE_NAME, newRefresh, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: newAccess });
  } catch (err) {
    // if token invalid signature
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (token) {
      // try to find user and clear stored refresh token
      try {
        const payload = verifyRefreshToken(token);
        const user = await User.findById(payload.id);
        if (user) {
          user.refreshTokenHash = null;
          await user.save();
        }
      } catch (e) {
        // ignore
      }
    }
    // clear cookie
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "strict", secure: process.env.COOKIE_SECURE === "true" });
    return res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // auth middleware will attach req.user
    const user = await User.findById(req.user.id).select("-passwordHash -refreshTokenHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

export default { register, login, refresh, logout, me };
