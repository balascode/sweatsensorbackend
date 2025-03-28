const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

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

const server = http.createServer(app);
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
  // Vercel-specific WebSocket configuration
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  path: "/socket.io/", // Explicit socket.io path
});

// Detailed connection logging
io.engine.on("connection_error", (err) => {
  console.error("Connection Error:", {
    code: err.code,
    message: err.message,
    context: err.context
  });
});

function generateSweatData() {
  return {
    sodium: Math.floor(Math.random() * (100 - 30) + 30),
    glucose: Math.floor(Math.random() * (20 - 5) + 5),
    hydration: Math.floor(Math.random() * (100 - 60) + 60),
    lactate: Math.floor(Math.random() * (15 - 5) + 5),
  };
}

io.on("connection", (socket) => {
  console.log("Frontend connected:", socket.id);
  
  // Send initial data immediately
  socket.emit("sweatData", generateSweatData());

  // Periodic data update
  const interval = setInterval(() => {
    socket.emit("sweatData", generateSweatData());
  }, 5000);

  socket.on("disconnect", () => {
    console.log("Frontend disconnected:", socket.id);
    clearInterval(interval);
  });
});

// Vercel serverless function export
module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    // Handle CORS preflight requests
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    return res.status(200).end();
  }

  // Your existing server logic
  server.emit('request', req, res);
};