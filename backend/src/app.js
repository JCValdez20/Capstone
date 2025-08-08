const express = require("express");
const app = express();
const parser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const connectDB = require("./models/database");
const session = require("express-session");
require("dotenv").config();

require("./config/passport");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

connectDB()
  .then(() => {})
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

app.use(morgan("dev"));
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  next();
});

const userRoutes = require("./routes/UserRoutes");
const authRoutes = require("./routes/AuthRoutes");
const adminRoutes = require("./routes/AdminRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

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
