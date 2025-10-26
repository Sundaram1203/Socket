// server.js
import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import socketRoutes from "./routes/socket.route.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// make io available to controllers via app
app.set("io", io);

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static files (if you want to use)
app.use("/public", express.static(path.join(__dirname, "public")));

// routes
app.use("/", socketRoutes);

// basic error handler
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ success: false, message: "Server error", error: err.message });
});

// socket.io connections (if you want to log)
io.on("connection", (socket) => {
  console.log("client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
