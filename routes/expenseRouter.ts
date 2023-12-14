import express, { Request, Response } from "express";
import Expense, { IExpense } from "../models/expense"; // Make sure to import your Expense model
import {authMiddleware, AuthRequest} from "../middlewares/authMiddleware";

const expenseRouter = express.Router();

expenseRouter.post(
  "/api/expense/create",
  authMiddleware,
  async (req: Request, res: Response) => {
    console.log(req.body);

    try {
      let expense: IExpense = new Expense({ ...req.body });
      console.log(expense);
      expense = await expense.save();
      console.log(expense);

      res.json(expense);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
);

export default expenseRouter;
