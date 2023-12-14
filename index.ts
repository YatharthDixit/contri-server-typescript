import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/authRouter";
import expenseRouter from "./routes/expenseRouter";

dotenv.config();
const PORT = 3000;
const app = express();
const DB = process.env.MONGODB_CONNECTION_STRING ?? "";

// Middleware
app.use(express.json());
app.use(authRouter);
app.use(expenseRouter);

// Connect to MongoDB
// console.log("Connecting");
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log("listening on port 3000!");
});
