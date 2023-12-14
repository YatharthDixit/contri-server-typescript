import mongoose, { Schema, Document, Types } from "mongoose";

interface IUserMap {
  [phoneNumber: string]: number;
}

export interface IExpense extends Document {
  totalAmount: number;
  description: string;
  type: string;
  userPaid: IUserMap;
  userSpent: IUserMap;
  groupId: Types.ObjectId;
  isGroupExpense: boolean;
  date: Date;
}

const expenseSchema: Schema<IExpense> = new Schema(
  {
    totalAmount: {
      type: Number,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "other",
      trim: true,
    },
    userPaid: {
      type: Map,
    },
    userSpent: {
      type: Map,
      // required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "Group",
    },
    isGroupExpense: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model<IExpense>("Expense", expenseSchema);
export default Expense;
