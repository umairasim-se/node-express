import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/UserSchema.js";
import mongoose from "mongoose";
import authenticateJWT from "../middleware/AuthenticateJWT.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const userByUsername = await UserModel.findOne({ username });
    const userByEmail = await UserModel.findOne({ email });

    if (userByUsername) {
      res
        .status(400)
        .json({ message: "Username already taken", status: "failed" });
      return;
    }

    if (userByEmail) {
      res
        .status(400)
        .json({ message: "Email already taken", status: "failed" });
      return;
    }

    const document = new UserModel({
      username,
      password,
      email,
    });

    await document.save();

    res
      .status(200)
      .json({ message: "User successfully created", status: "success" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", status: "failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });

    if (!user) {
      res.status(404).json({ message: "User not found", status: "Failed" });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res
        .status(404)
        .json({ message: "Invalid Credentials", status: "Failed" });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: 86400,
    });

    res.status(200).json({
      status: "Success",
      message: "Login successful",
      token,
      id: user._id,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", status: "failed" });
  }
});

router.put("/update-user/:id", authenticateJWT, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)) {
      await UserModel.findOneAndUpdate(
        id,
        {
          username,
          password: await bcrypt.hash(password, 10),
          email,
        },
        { new: true, upsert: true }
      );

      res
        .status(200)
        .json({ message: "User updated successfully", status: "success" });
    } else {
      res.status(400).json({ message: "Invalid ID", status: "failed" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", status: "failed" });
  }
});

router.delete("/delete-user/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid id", status: "failed" });
      return;
    }

    await UserModel.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "User deleted successfully", status: "success" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", status: "failed" });
  }
});

export default router;
