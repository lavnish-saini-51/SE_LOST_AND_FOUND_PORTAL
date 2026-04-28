const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/User");

function signToken(userId) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) {
      res.status(401);
      throw new Error("Not authorized");
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(401);
    throw new Error("Invalid token");
  }
});

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }
  next();
};

module.exports = { requireAuth, requireAdmin, signToken, setAuthCookie };

