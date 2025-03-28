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
  // Enhanced WebSocket configuration
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  path: "/socket.io/", // Explicitly set socket.io path
});

// Detailed connection logging
io.engine.on("connection_error", (err) => {
  console.log("Connection Error:", err.code);
  console.log("Connection Error Message:", err.message);
  console.log("Connection Error Context:", err.context);
});

// Rest of your existing server code remains the same
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
  socket.emit("sweatData", generateSweatData());

  const interval = setInterval(() => {
    socket.emit("sweatData", generateSweatData());
  }, 5000);

  socket.on("disconnect", () => {
    console.log("Frontend disconnected:", socket.id);
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${JSON.stringify(
    [
      "http://localhost:3000", 
      "https://sweatsensor.vercel.app",
      "https://www.sweatsensor.vercel.app"
    ]
  )}`);
});