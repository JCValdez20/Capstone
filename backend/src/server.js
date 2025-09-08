require("dotenv").config();
const app = require("./app");
const { port } = require("./config/config");
const { setupSocketIO } = require("./utils/Socket");

// Setup Socket.IO with the Express app
const { io, server } = setupSocketIO(app);

// Make io available globally for other parts of the app
global.io = io;

server.listen(port, () => {
  console.log("Server is running on port: " + port);
  console.log("Socket.IO server is ready");
});
