// controllers/socket.controller.js
import { Validator } from "node-input-validator";
import * as model from "../models/socket.model.js";

// Render index.ejs with current users

export const renderIndex = async (req, res, next) => {
  try {
    const users = await model.getAllUsers();
    res.render("index", { users });
  } catch (err) {
    next(res.status(200).json({ status: false, message: err }));
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const v = new Validator(req.body, {
      first_name: "required|string|maxLength:255",
      last_name: "string|maxLength:255",
      email: "required|email|maxLength:150",
      phone_number: "required|string|maxLength:20",
      created_by: "string|maxLength:100"
    });

    const matched = await v.check();
    if (!matched) {
      return res.status(200).json({ success: false, errors: v.errors });
    }

    const newUser = await model.insertUser(req.body);

    // emit to connected clients via socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("user:created", newUser);
    }

    return res.status(200).json({ status: true, message: "Data successfully inserted"});
  } catch (err) {
    next(err);
  }
};


export const getUsersJson = async (req, res, next) => {
  try {
    const users = await model.getAllUsers();
    res.status(200).json({ status: true, message: "Data successfully retrived", data: users });
  } catch (err) {
    next(res.status(200).json({ status: false, message: err }));
  }
};
