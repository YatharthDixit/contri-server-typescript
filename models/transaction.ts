import mongoose, { Schema } from "mongoose";

export interface ITransaction extends mongoose.Document {
  amount: number;
  expense: mongoose.Types.ObjectId;
  userGivenPhone: string;
  userTakenPhone: string;
  createdAt: Date;
}

const transactionSchema: Schema<ITransaction> = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userGivenPhone: 1, userTakenPhone: 1 });

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
export default Transaction;
