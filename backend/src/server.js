require("dotenv").config();
const http = require("http");
const express = require("express");
const app = require("./app");
const { port } = require("./config/config");

const server = http.createServer(app);

server.listen(port, () => {
  console.log("Server is running on port: " + port);
});
