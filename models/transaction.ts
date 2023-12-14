import mongoose from "mongoose";

export interface ITransaction extends mongoose.Document {
  amount: number;
  expense: mongoose.Types.ObjectId;
  userGivenPhone: string;
  userTakenPhone: string;
}

const transactionSchema: mongoose.Schema<ITransaction> = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,

    trim: true,
  },
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    required: true,
  },
  userGivenPhone: {
    type: String,
    required: true,
    trim: true,
  },
  userTakenPhone: {
    type: String,
    required: true,
    trim: true,
  },
});

// delete mongoose.models["Expense"];

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
export default Transaction;
