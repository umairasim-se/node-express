import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/UserSchema.js";
import mongoose from "mongoose";
import authenticateJWT from "../middleware/AuthenticateJWT.js";
import { authenticateUser } from "../middleware/AuthenticateUserLogin.js";
import { generateJWT } from "../utils/generateTokens.js";

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

    const tokens = await generateJWT(user._id);
    req.session.loggedin = true;

    res.status(200).json({
      status: "Success",
      message: "Login successful",
      tokens,
      id: user._id,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", status: "failed" });
  }
});

router.put(
  "/update-user/:id",
  authenticateJWT,
  authenticateUser,
  async (req, res) => {
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
  }
);

router.delete(
  "/delete-user/:id",
  authenticateJWT,
  authenticateUser,
  async (req, res) => {
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
  }
);

router.post(
  "/refresh-token/:id",
  authenticateUser,
  authenticateJWT,
  (req, res) => {
    try {
      const { id } = req.params;

      const token = jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: "2h",
      });

      res.status(200).json({
        token,
        message: "Succesfully Generated new Token",
        status: "success",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Interal Server Error", status: "failed" });
    }
  }
);

router.delete("/logout", authenticateJWT, authenticateUser, (req, res) => {
  try {
    if (req.session.loggedin) {
      req.session.destroy((err) => {
        if (err) {
          res
            .status(400)
            .json({ message: "Unable to destroy session", status: "failed" });
        } else {
          res
            .status(200)
            .json({ message: "Logout successfull", status: "success" });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Interal Server Error", status: "failed" });
  }
});

export default router;
