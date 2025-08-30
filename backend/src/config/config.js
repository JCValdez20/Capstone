require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000, // Fallback to 3000 if PORT not set
  mongoURI: process.env.MONGO_URI,
};
