const express = require("express");
const app = express();
const parser = require("body-parser");
const morgan = require("morgan");
const database = require("./models/database");
require("dotenv").config();

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
const productRoutes = require("./routes/ProductRoutes");
const authRoutes = require("./routes/AuthRoutes");

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/user", userRoutes);

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
