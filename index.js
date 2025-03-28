const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Create Express app
const app = express();

// Comprehensive CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sweatsensor.vercel.app",
    "https://www.sweatsensor.vercel.app"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Create HTTP server
const server = http.createServer(app);

// Socket.IO configuration with extensive options
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "https://sweatsensor.vercel.app",
      "https://www.sweatsensor.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  // Important: Explicit path configuration
  path: "/socket.io/",
});

// Detailed connection error logging
io.engine.on("connection_error", (err) => {
  console.error("Socket.IO Connection Error:", {
    code: err.code,
    message: err.message,
    context: err.context
  });
});

// Simulate sweat data generation
function generateSweatData() {
  return {
    sodium: Math.floor(Math.random() * (100 - 30) + 30),
    glucose: Math.floor(Math.random() * (20 - 5) + 5),
    hydration: Math.floor(Math.random() * (100 - 60) + 60),
    lactate: Math.floor(Math.random() * (15 - 5) + 5),
  };
}

// Socket connection handling
io.on("connection", (socket) => {
  console.log("Frontend connected:", socket.id);
  
  // Immediate data emission
  socket.emit("sweatData", generateSweatData());

  // Periodic data updates
  const interval = setInterval(() => {
    socket.emit("sweatData", generateSweatData());
  }, 5000);

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log("Frontend disconnected:", socket.id);
    clearInterval(interval);
  });
});

// Vercel serverless function export
module.exports = (req, res) => {
  // CORS preflight handling
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Pass request to server
  server.emit('request', req, res);
};