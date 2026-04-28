require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

const { notFound, errorHandler } = require("./middleware/error");

const authRoutes = require("./routes/auth.routes");
const lostRoutes = require("./routes/lost.routes");
const foundRoutes = require("./routes/found.routes");
const itemsRoutes = require("./routes/items.routes");
const notifyRoutes = require("./routes/notify.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const claimsRoutes = require("./routes/claims.routes");

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.set("trust proxy", 1);
app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Static uploads (local fallback if Cloudinary not configured)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/lost", lostRoutes);
app.use("/api/found", foundRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/notify", notifyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/claims", claimsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
