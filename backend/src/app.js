const express = require("express");
const parser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const connectDB = require("./models/database");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

require("dotenv").config();

require("./config/passport");

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for now to avoid conflicts
  })
);

// Cookie parser middleware
app.use(cookieParser());

// CORS configuration with credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Passport initialization (without session)
app.use(passport.initialize());

connectDB()
  .then(() => {})
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

app.use(morgan("dev"));
app.use(parser.urlencoded({ limit: "10mb", extended: true }));
app.use(parser.json({ limit: "10mb" }));

const userRoutes = require("./routes/UserRoutes");
const authRoutes = require("./routes/AuthRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const bookingRoutes = require("./routes/BookingRoutes");
const MessagingRoutes = require("./routes/MessagingRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/bookings", bookingRoutes);
app.use("/messages", MessagingRoutes);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  res.json({
    error: error.message,
  });
});

app.use((req, res, next) => {
  return res.status(error.status || 500);
  res.json({
    error: error.message,
  });
});

module.exports = app;
