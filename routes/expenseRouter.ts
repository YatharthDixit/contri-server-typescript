import express, { Request, Response } from "express";
import Expense, { IExpense } from "../models/expense"; // Make sure to import your Expense model
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";
import Transaction, { ITransaction } from "../models/transaction";
import { User } from "../models/user";

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
// async function getBalanceWithFriend(req: AuthRequest): Promise<number> {
//   const { userPhone, friendPhone } = req.body;
//   // Get user phone from authMiddleware
//   // const userPhone = user.phoneNumber;
//   const pipeline = [
//     {
//       $match: {
//         $or: [
//           { userGivenPhone: userPhone },
//           { userGivenPhone: friendPhone },
//           { userTakenPhone: userPhone },
//           { userTakenPhone: friendPhone },
//         ],
//       },
//     },
//     {
//       $group: {
//         _id: {
//           userGivenPhone: "$userGivenPhone",
//           userTakenPhone: "$userTakenPhone",
//         },
//         totalPaid: { $sum: "$amount" },
//         totalReceived: { $sum: "$amount" },
//       },
//     },
//     {
//       $project: {
//         _id: "$_id.userGivenPhone",
//         balance: { $subtract: ["$totalPaid", "$totalReceived"] },
//       },
//     },
//     {
//       $match: {
//         _id: userPhone,
//         userTakenPhone: friendPhone,
//       },
//     },
//     {
//       $project: {
//         balance: 1,
//       },
//     },
//   ];

//   const result = await Transaction.aggregate(pipeline);
//   const balance = result.length ? result[0].balance : 0; // Extract balance or set to 0 if no document found

//   return balance;
// }

async function calculateAndSaveTransactions(expense: IExpense) {
  try {
    const { userPaid, userSpent, _id: expenseId } = expense;

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

expenseRouter.get(
  "/api/expense/",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userPhone = req.user; // Assuming userPhone is present in the request header

      // Check if userPhone is provided
      if (!userPhone) {
        return res
          .status(400)
          .json({ message: "userPhone is required in the header" });
      }

      // Find expenses where userPhone is present in userSpent map
      const expenses: IExpense[] = await Expense.find({
        [`userSpent.${userPhone}`]: { $exists: true },
      });

      res.status(200).json(expenses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// function calculate_user_receive_amount(
//   expense: IExpense,
//   phone: string
// ): number {
//   const userSpent: Number = expense.userSpent.get(phone);
//   const userPaid :Number = expense.userPaid.get(phone);
//   return userPaid - userSpent;
// }

// expenseRouter.post(
//   "/api/balance/friend",
//   async (req: Request, res: Response) => {
//     // Validate request body
//     const { friendPhone, userPhone } = req.body;
//     if (!friendPhone || !userPhone) {
//       return res.status(400).json({ error: "Missing friendPhone parameter" });
//     }

//     // Get user information from authMiddleware
//     // const userPhone = req.user.phoneNumber;

//     try {
//       const userA = await User.findOne({ phoneNumber: userPhone });
//       const userB = await User.findOne({ phoneNumber: friendPhone });
//       console.log(userA, userB);

//       const result = await Transaction.aggregate([
//         {
//           $match: {
//             $or: [
//               {
//                 $and: [
//                   { userGivenPhone: userPhone },
//                   { userTakenPhone: friendPhone },
//                 ],
//               },

//               {
//                 $and: [
//                   { userGivenPhone: friendPhone },
//                   { useruserTakenPhoneB: userPhone },
//                 ],
//               },
//             ],
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalSum: { $sum: "$amount" },
//           },
//         },
//       ]);

//       const sum = result.length > 0 ? result[0].totalSum : 0;

//       res.json({ sum });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );
expenseRouter.post(
  "/api/balance/friend",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    // Validate request body
    const userPhone = req.user;
    console.log("userPhone", userPhone);

    const { friendPhone } = req.body;
    if (!friendPhone || !userPhone) {
      return res.status(400).json({ error: "Missing friendPhone parameter" });
    }

    // Get user information from authMiddleware
    // const userPhone = req.user.phoneNumber;

    try {
      const userA = await User.findOne({ phoneNumber: userPhone });
      const userB = await User.findOne({ phoneNumber: friendPhone });
      console.log(userA, userB);

      const result = await Transaction.aggregate([
        {
          $match: {
            $or: [
              {
                $and: [
                  { userGivenPhone: userPhone },
                  { userTakenPhone: friendPhone },
                ],
              },

              {
                $and: [
                  { userGivenPhone: friendPhone },
                  { userTakenPhone: userPhone },
                ],
              },
            ],
          },
        },
        {
          $project: {
            _id: null,
            amount: {
              $cond: {
                if: { $eq: ["$userGivenPhone", userPhone] },
                then: "$amount",
                else: { $multiply: [-1, "$amount"] },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSum: { $sum: "$amount" },
          },
        },
      ]);

      const balance = result.length > 0 ? result[0].totalSum : 0;

      res.json({ balance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

expenseRouter.get(
  "/api/balance/",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    // Validate request body
    const userPhone = req.user;
    console.log("userPhone", userPhone);

    // const { friendPhone } = req.body;
    if (!userPhone) {
      return res.status(400).json({ error: "Missing friendPhone parameter" });
    }

    // Get user information from authMiddleware
    // const userPhone = req.user.phoneNumber;

    try {
      // const userA = await User.findOne({ phoneNumber: userPhone });
      // const userB = await User.findOne({ phoneNumber: friendPhone });
      const result = await Transaction.aggregate([
        {
          $match: {
            $or: [{ userGivenPhone: userPhone }, { userTakenPhone: userPhone }],
          },
        },
        {
          $project: {
            _id: null,
            inAmount: {
              $cond: {
                if: { $eq: ["$userGivenPhone", userPhone] },
                then: "$amount",
                else: 0,
              },
            },
            outAmount: {
              $cond: {
                if: { $eq: ["$userTakenPhone", userPhone] },
                then: "$amount",
                else: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            incomingAmount: { $sum: "$inAmount" },
            outgoingAmount: { $sum: "$outAmount" },
          },
        },
      ]);

      const summary =
        result.length > 0
          ? result[0]
          : { incomingAmount: 0, outgoingAmount: 0 };

      res.json({ summary });
      console.log(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

expenseRouter.get(
  "/api/friends",
  authMiddleware, // Use your authentication middleware here
  async (req : AuthRequest, res) => {
    try {
      const userPhone = req.user; // Assuming your middleware sets req.user to the user's phone

      // Find friends based on the conditions
      const friends = await Transaction.distinct("userTakenPhone", {
        $or: [
          { userGivenPhone: userPhone },
          { userTakenPhone: userPhone },
        ],
      });

      res.json({ friends });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

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
