// routes/socket.routes.js
import express from "express";
import * as controller from "../controllers/socket.controller.js";

const router = express.Router();

// Render to EJS 
router.get("/", controller.renderIndex);

// routes API
router.post("/register", controller.registerUser); // use Postman to insert
router.get("/users", controller.getUsersJson);

export default router;