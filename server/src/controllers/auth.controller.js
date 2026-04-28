const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const { signToken, setAuthCookie } = require("../middleware/auth");

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }
  if (String(password).length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    res.status(409);
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    passwordHash
  });

  const token = signToken(user._id.toString());
  setAuthCookie(res, token);
  res.status(201).json({ user: sanitizeUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }
  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = signToken(user._id.toString());
  setAuthCookie(res, token);
  res.json({ user: sanitizeUser(user) });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  // requireAuth sets req.user
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = { register, login, logout, me };

