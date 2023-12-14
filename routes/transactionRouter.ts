import express, { Request, Response } from "express";
import Transaction, { ITransaction } from "../models/transaction"; // Make sure to import your Expense model
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";

const transactionRouter = express.Router();

transactionRouter.post(
  "/api/transaction/create",
  authMiddleware,
  async (req: Request, res: Response) => {
    console.log(req.body);

    try {
      let transaction: ITransaction = new Transaction({ ...req.body });
      console.log(transaction);
      transaction = await transaction.save();
      console.log(transaction);

      res.json(transaction);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
);

export default transactionRouter;
