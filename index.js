const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const http = require('http')
require("dotenv").config();
const db = require("./dbConfig/db");
const authRouter = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const itemRoutes = require("./routes/itemRoutes");
const bidRoutes = require("./routes/bidRoutes");
const notificationRoutes = require('./routes/notificationRoutes')
const { wss, handleWebSocketConnection } = require("./sockets/socket");

// rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per ms
  message: "Too many requests from this IP, please try again later"
});

app.use(limiter); // Apply rate limiting to all requests


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect with Database
db.pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to the database");
  connection.release();
});

app.use("/users", authRouter);
app.use("/items", itemRoutes);
app.use("/items", bidRoutes);
app.use('/notifications',notificationRoutes)

// Create HTTP server and attach the Express app
const server = http.createServer(app);

// Handle WebSocket connections
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', handleWebSocketConnection);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
