import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Routes from "./Routes/routes.js";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";

const app = express();

const port = process.env.PORT || 5000;
const DB_URL = process.env.MONGODB_URL;
const oneDay = 1000 * 60 * 60 * 24;

app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
  })
);

app.use("/api", Routes);

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(`Error connecting to MongoDB: ${err}`);
    process.exit(1);
  });

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});
