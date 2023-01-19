import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { v4 } from "uuid";
import UserSchema from "../models/UserSchema.js";

export const generateJWT = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return;
    }

    const token = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });
    const refreshToken = jwt.sign(
      { id: userId, token: v4() },
      process.env.SECRET_KEY,
      {
        expiresIn: "7h",
      }
    );

    const user = await UserSchema.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );

    return { token, refreshToken };
  } catch (error) {
    console.log(error);
  }
};
