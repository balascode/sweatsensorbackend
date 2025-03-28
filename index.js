const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors"); // Make sure to install cors package: npm install cors

const app = express();

// Apply CORS middleware to express app
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sweatsensor.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://sweatsensor.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Add these options to handle CORS and connection more robustly
  allowEIO3: true, // Enable Engine.IO version 3 for broader compatibility
  pingTimeout: 60000, // Increase timeout
  pingInterval: 25000, // Adjust ping interval
});

// Simulate sweat data
function generateSweatData() {
  return {
    sodium: Math.floor(Math.random() * (100 - 30) + 30), // 30-100 mg/L
    glucose: Math.floor(Math.random() * (20 - 5) + 5),   // 5-20 mg/dL
    hydration: Math.floor(Math.random() * (100 - 60) + 60), // 60-100%
    lactate: Math.floor(Math.random() * (15 - 5) + 5),   // 5-15 mmol/L
  };
}

io.on("connection", (socket) => {
  console.log("Frontend connected");
  // Send initial data
  socket.emit("sweatData", generateSweatData());

  // Simulate real-time updates every 5 seconds
  const interval = setInterval(() => {
    socket.emit("sweatData", generateSweatData());
  }, 5000);

  socket.on("disconnect", () => clearInterval(interval));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));