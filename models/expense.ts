import mongoose, { Schema, Document, Types } from "mongoose";

class TypedMap<V> extends Map<string, V> {}

export interface IExpense extends Document {
  totalAmount: number;
  description: string;
  type: string;
  userPaid: { [phone: string]: number };
  userSpent: { [phone: string]: number };
  groupId: Types.ObjectId;
  isSettlement: boolean;
  isGroupExpense: boolean;
  // date: Date;
}

// Update expenseSchema
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
      default: "Others",
      trim: true,
    },
    userPaid: {
      type: Object, // Change to Object
      required: true,
    },
    userSpent: {
      type: Object, // Change to Object
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    isGroupExpense: {
      type: Boolean,
      default: false,
    },
    // date: {
    //   type: Date,
    //   default: Date.now,
    // },
    isSettlement: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model<IExpense>("Expense", expenseSchema);
export default Expense;
