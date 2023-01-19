import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { v4 } from "uuid";

export const generateJWT = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return;
    }

    const token = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
      expiresIn: "2d",
    });
    const refreshToken = jwt.sign(
      { id: userId, token: v4() },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    return { token, refreshToken };
  } catch (error) {
    console.log(error);
  }
};
