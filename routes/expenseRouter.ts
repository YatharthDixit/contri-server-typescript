import express, { Request, Response } from "express";
import Expense, { IExpense } from "../models/expense"; // Make sure to import your Expense model
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";
import Transaction, { ITransaction } from "../models/transaction";

// async function calculateAndSaveTransactions(expense: IExpense) {
//   try {
//     // Extract necessary information from the expense
//     const { userSpent, userPaid, groupId, isGroupExpense, totalAmount } =
//       expense;

//     // Calculate transactions based on userSpent and userPaid
//     const transactions: ITransaction[] = [];

//     Object.keys(userSpent).forEach((payerPhone) => {
//       const amountSpent = userSpent[payerPhone];
//       const amountPaid = userPaid[payerPhone] || 0; // Handle case where userPaid may not exist

//       const netAmount = amountPaid - amountSpent;

//       if (netAmount !== 0) {
//         const transaction = new Transaction({
//           amount: netAmount,
//           expense: expense._id,
//           userGivenPhone: payerPhone,
//           userTakenPhone: isGroupExpense
//             ? groupId.toString()
//             : expense.groupId.toString(),
//         });
//         transactions.push(transaction);
//       }
//     });

//     // Save transactions to the database
//     const createdtransaction = await Transaction.insertMany(transactions);
//     return createdtransaction;

//     console.log("Transactions saved successfully:", transactions);
//   } catch (error) {
//     console.error("Error calculating and saving transactions:", error);
//     throw error;
//   }
// }
// async function calculateAndSaveTransactions(expense: IExpense) {
//   try {
//     const { userPaid, userSpent, _id: expenseId } = expense;

//     const transactions: ITransaction[] = [];

//     Object.keys(userPaid).forEach((payerPhone) => {
//       console.log("Payer phone:", payerPhone);
//       const amountPaid = userPaid[payerPhone] || 0;
//       const amountSpent = userSpent[payerPhone] || 0;

//       const netAmount = Number(amountPaid) - Number(amountSpent);

//       if (netAmount < 0) {
//         // This user needs to give money to others
//         Object.keys(userSpent).forEach((receiverPhone) => {
//           const amountReceived =
//             (Number(userSpent[receiverPhone]) / expense.totalAmount) *
//             netAmount;

//           if (amountReceived !== 0 && payerPhone !== receiverPhone) {
//             const transaction = new Transaction({
//               amount: amountReceived,
//               expense: expenseId,
//               userGivenPhone: payerPhone,
//               userTakenPhone: receiverPhone,
//             });
//             transactions.push(transaction);
//           }
//         });
//       }
//     });
//     console.log("Transactions to be saved:", transactions);
//     // Save transactions to the database
//     const createdtransactions = await Transaction.insertMany(transactions);
//     return createdtransactions;

//     // console.log("Transactions saved successfully:", transactions);
//   } catch (error) {
//     console.error("Error calculating and saving transactions:", error);
//     throw error;
//   }
// }
//LAST -----------------------
// async function calculateAndSaveTransactions(expense: IExpense) {
//   try {
//     const { userPaid, userSpent, _id: expenseId, totalAmount } = expense;

//     const transactions: ITransaction[] = [];

//     // Calculate net amount for each user
//     const netAmounts: { [phone: string]: number } = {};

//     Object.keys(userPaid).forEach((payerPhone) => {
//       const amountPaid: number = userPaid[payerPhone] || 0;
//       const amountSpent: number = userSpent[payerPhone] || 0;
//       netAmounts[payerPhone] = amountPaid - amountSpent;
//     });

//     // Generate transactions based on net amounts
//     Object.keys(userPaid).forEach((payerPhone) => {
//       let netPayerAmount = netAmounts[payerPhone];

//       if (netPayerAmount > 0) {
//         // This user needs to give money to others
//         Object.keys(userSpent).forEach((receiverPhone) => {
//           let netRecieveAmount = netAmounts[receiverPhone];

//           while (netRecieveAmount < 0) {
//             if (Math.abs(netRecieveAmount) >= Math.abs(netPayerAmount)) {
//               const transaction = new Transaction({
//                 amount: netPayerAmount,
//                 expense: expenseId,
//                 userGivenPhone: payerPhone,
//                 userTakenPhone: receiverPhone,
//               });
//               transactions.push(transaction);
//               netAmounts[payerPhone] = 0;
//               netAmounts[receiverPhone] = netRecieveAmount + netPayerAmount;
//             } else {
//               const netAmount =
//                 Math.abs(netPayerAmount) - Math.abs(netRecieveAmount);

//               const transaction = new Transaction({
//                 amount: netAmount,
//                 expense: expenseId,
//                 userGivenPhone: payerPhone,
//                 userTakenPhone: receiverPhone,
//               });
//               transactions.push(transaction);
//               netAmounts[payerPhone] = netPayerAmount - netAmount;
//               netAmounts[receiverPhone] = 0;
//             }
//             netRecieveAmount = netAmounts[receiverPhone];
//             netPayerAmount = netAmounts[payerPhone];
//           }
//         });
//       }
//     });

//     // Save transactions to the database
//     console.log("Transactions to be saved:", transactions);
//     const createdTransactions = await Transaction.insertMany(transactions);
//     return createdTransactions;
//   } catch (error) {
//     console.error("Error calculating and saving transactions:", error);
//     throw error;
//   }
// }

async function calculateAndSaveTransactions(expense: IExpense) {
  try {
    const { userPaid, userSpent, _id: expenseId, totalAmount } = expense;

    const transactions: ITransaction[] = [];

    // Create a debt map to track remaining debt for each user
    const debtMap: { [phone: string]: number } = {};
    Object.keys(userPaid).forEach((payerPhone) => {
      debtMap[payerPhone] = userPaid[payerPhone] - (userSpent[payerPhone] || 0);
    });

    // Process debts until all are settled or no progress is made
    let settled = false;
    while (!settled) {
      settled = true; // Assume settled until proven otherwise

      // Find a payer with positive debt
      let payerPhone: string | undefined;
      for (const phone in debtMap) {
        if (debtMap[phone] > 0) {
          payerPhone = phone;
          break;
        }
      }

      // No payer found, all debts settled
      if (!payerPhone) {
        break;
      }

      // Find a receiver with negative debt
      let receiverPhone: string | undefined;
      for (const phone in debtMap) {
        if (debtMap[phone] < 0) {
          receiverPhone = phone;
          break;
        }
      }

      // No receiver found, remaining debts can't be settled
      if (!receiverPhone) {
        break;
      }

      // Calculate transaction amount
      const maxTransfer = Math.min(
        debtMap[payerPhone],
        Math.abs(debtMap[receiverPhone])
      );

      // Create and record transaction
      const transaction = new Transaction({
        amount: maxTransfer,
        expense: expenseId,
        userGivenPhone: payerPhone,
        userTakenPhone: receiverPhone,
      });
      transactions.push(transaction);

      // Update debt map
      debtMap[payerPhone] -= maxTransfer;
      debtMap[receiverPhone] += maxTransfer;

      // Check if all debts are settled
      settled = Object.values(debtMap).every((debt) => debt === 0);
    }

    // Save transactions to the database
    if (transactions.length) {
      const createdTransactions = await Transaction.insertMany(transactions);
      return createdTransactions;
    } else {
      console.log("No transactions generated, all debts already settled.");
      return [];
    }
  } catch (error) {
    console.error("Error calculating and saving transactions:", error);
    throw error;
  }
}

// Example usage:
// Assuming you have an expense instance (let's call it newExpense)

// Save the expense to the database

// Calculate and save transactions

const expenseRouter = express.Router();

// function calculate_user_receive_amount(
//   expense: IExpense,
//   phone: string
// ): number {
//   const userSpent: Number = expense.userSpent.get(phone);
//   const userPaid :Number = expense.userPaid.get(phone);
//   return userPaid - userSpent;
// }

expenseRouter.post(
  "/api/expense/create",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      console.log("Request body:", req.body);
      const { totalAmount, description, type, userPaid, userSpent } = req.body; // Extract relevant data

      // const paidUser =
      const numUsers = Object.keys(userPaid).length;

      // Calculate individual contribution
      // const individualContribution = totalAmount / numUsers;

      // Create and save Expense document
      const expense = await Expense.create({
        ...req.body,
      });

      const createdExpense = await expense.save();

      const transactions = await calculateAndSaveTransactions(
        createdExpense.toObject()
      );

      res.json({
        ...expense.toObject(),
        transactions: transactions,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
);

export default expenseRouter;
