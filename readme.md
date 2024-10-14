

# Contri (Backend)

## Project Description
This repository contains the backend code for Contri, a bill splitting app designed to simplify expense sharing with friends and family. This new version of the backend is built with Node.js, Express.js, and MongoDB (using Mongoose) for robust performance and scalability. It utilizes JWT for secure authentication and is written entirely in TypeScript for improved code maintainability.

**Frontend Repository:** [Link to your frontend repository]

## Features
* **Universal Bill Splitting:** Split bills with anyone, regardless of whether they are registered on the app.
* **Historical Data:** Access and view all past bills split by others once you sign up.
* **Unlimited Participants:** Add any number of people to a bill.
* **Flexible Splitting:** Split expenses equally or customize the split based on individual contributions.
* **Personal Tracking:** Keep track of all bills shared with a specific person.
* **Secure Authentication:**  JWT (JSON Web Tokens) are used for secure user authentication.
* **Detailed Transaction Records:**  Transactions are meticulously tracked, providing a clear record of who owes whom and how much.
* **Balance Calculation:** Easily determine the outstanding balance with a specific friend.
* **Streak Calculation:**  Track the consecutive days of transactions with a friend, adding a fun element to shared expenses.

## APIs
The API endpoints are documented below. You can also import the Postman collection to explore and test the API functionality.

**Postman Collection:** [Link to your Postman collection JSON file]

| Endpoint | Method | Description | Authentication Required |
|---|---|---|---|
| /api/createAccount | POST | Create a new user account | No |
| /api/signin | POST | Sign in using OTPless token | No |
| / | GET | Get current user details | Yes |
| /api/expense/create | POST | Create a new expense | Yes |
| /api/balance/friend | POST | Check balance with a friend | Yes |
| /api/expense/ | GET | Get all expenses for the current user | Yes |
| /api/balance | GET | Check overall balance for the current user | Yes |
| /api/friends | GET | Get a list of friends | Yes |
| /api/friend/expenses | POST | Get expenses with a specific friend | Yes |
| /api/expense/get | POST | Get a specific expense by ID | Yes |

## Installation
1. Clone the repository: `git clone `[https://github.com/YatharthDixit/contri-server-typescript](https://github.com/YatharthDixit/contri-server-typescript)
2. Install dependencies: `npm install`
3. Set up environment variables: Create a `.env` file based on the `.env.example` file and populate it with your MongoDB connection string and any other sensitive information.
4. Run the application: `npm start`

## Contributing
Feel free to submit pull requests or raise issues if you encounter any bugs or have suggestions for improvements.

## License
[Specify your license, e.g., MIT License]

---