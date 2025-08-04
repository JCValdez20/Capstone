require("dotenv").config();
const mongoose = require("mongoose");
const db = require("../config/config");

mongoose
  .connect(db.mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => console.log(error));
