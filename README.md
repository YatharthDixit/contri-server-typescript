# Contri Server (TypeScript)

Backend API for **Contri**, a bill-splitting app for tracking shared expenses with friends and settling up who owes whom. Built with Express, TypeScript, and MongoDB/Mongoose, with phone-number-based accounts and JWT authentication.

**Frontend:** [contri-new](https://github.com/yatharthdixit/contri-new)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Models](#data-models)
- [How Settlement Works](#how-settlement-works)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Known Limitations](#known-limitations)
- [License](#license)

## Features

- **Phone-number-based accounts** — users are identified by `phoneNumber` rather than a username/email
- **Flexible expense splitting** — each expense stores a per-person `userPaid`/`userSpent` breakdown, supporting unequal contributions
- **Automatic debt settlement** — creating an expense generates the minimal set of `Transaction` records needed to settle it (see [How Settlement Works](#how-settlement-works))
- **Friend balances** — net balance with one friend, or an overall incoming/outgoing summary across everyone
- **Friends list** — derived from transaction history, sorted by most recent activity
- **Transaction streaks** — consecutive-day activity streak with a specific friend
- **JWT-based sessions** issued on account creation / sign-in

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Language | TypeScript |
| Database / ODM | MongoDB with Mongoose 8 |
| Auth | `jsonwebtoken`, custom middleware (see [Known Limitations](#known-limitations)) |
| Dates | `date-fns` |
| HTTP client | `axios` (for the OTPless integration) |
| Dev tooling | `nodemon`, `ts-node-dev`, `tsc` |

## Architecture

```
index.ts               # App bootstrap: Express app, MongoDB connection, router mounting
├── routes/
│   ├── authRouter.ts       # Account creation, sign-in, token check, profile lookup
│   ├── expenseRouter.ts    # Expenses, balances, friends, streaks
│   └── transactionRouter.ts  # Defines POST /api/transaction/create — not mounted in index.ts (dead code today)
├── middlewares/
│   └── authMiddleware.ts   # Verifies the `x-auth-token` header and attaches the user's phone number to the request
└── models/
    ├── user.ts         # User accounts
    ├── expense.ts       # Shared expenses
    └── transaction.ts    # Individual settle-up transfers between two phone numbers
```

There's no separate controller/service layer here — route handlers in `routes/` talk to the Mongoose models directly.

## Data Models

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `phoneNumber` (unique), `name`, `upi`, `email`, `type`, `didUserSigned`, `currency`, `country`, `photoURL`, `fcmToken` | Identity is the phone number; `fcmToken` is stored on the schema but no route currently sets it |
| **Expense** | `totalAmount`, `description`, `type`, `userPaid` (object: phone → amount), `userSpent` (object: phone → amount), `groupId`, `isGroupExpense`, `isSettlement`, timestamps | `userPaid`/`userSpent` are plain objects keyed by phone number rather than a Mongoose `Map` or subdocument array |
| **Transaction** | `amount`, `expense` (ref), `userGivenPhone`, `userTakenPhone`, timestamps | One directional transfer between two phone numbers for a given expense; compound index on `(userGivenPhone, userTakenPhone)` |

## How Settlement Works

When an expense is created (`POST /api/expense/create`), `calculateAndSaveTransactions` (in [routes/expenseRouter.ts](routes/expenseRouter.ts)) computes each participant's net position (`userPaid - userSpent`), then greedily pairs people who overpaid with people who underpaid until every balance nets to zero — producing the smallest number of `Transaction` records that settle the expense. Balances (`GET /api/balance`, `POST /api/balance/friend`) are derived on read by aggregating these `Transaction` documents; the running balance isn't stored anywhere.

## Getting Started

### Prerequisites

- Node.js
- A MongoDB instance (local or Atlas)

### Installation

```bash
git clone git@github.com:YatharthDixit/contri-server-typescript.git
cd contri-server-typescript
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Server port — currently informational only; `index.ts` hardcodes the listen port to `3000` |
| `MONGODB_CONNECTION_STRING` | MongoDB connection string |
| `JWT_SECRET` | Documented for signing JWTs, but not currently read by the code — see [Known Limitations](#known-limitations) |
| `OTPLESS_CLIENT_ID` / `OTPLESS_CLIENT_SECRET` | Credentials for the OTPless phone-verification integration (currently unfinished — see [Known Limitations](#known-limitations)) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | No Cloudinary SDK is installed or used in the current code; `User.photoURL` just defaults to a static Cloudinary-hosted image URL. Likely reserved for a future avatar-upload feature |

### Running the App

```bash
npm run dev      # nodemon running index.ts directly via ts-node
npm run build     # compile TypeScript to dist/
npm start         # run the compiled build (dist/index.js) — run `npm run build` first
```

## API Reference

Routes are mounted at the app root in [index.ts](index.ts) (no shared `/api` prefix at the router level — each route declares its own full path). Authenticated routes expect the JWT in a custom **`x-auth-token`** header, not `Authorization: Bearer`. A ready-to-use request collection is in [`Contri.postman_collection.json`](Contri.postman_collection.json).

#### Auth — `routes/authRouter.ts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/createAccount` | No | Create (or reactivate) a user by phone number; returns a JWT |
| POST | `/api/signin` | No | Exchange a token for a session JWT — see [Known Limitations](#known-limitations) |
| POST | `/TokenIsValid` | No | Check whether an `x-auth-token` is a validly signed token |
| GET | `/` | Yes | Get the current authenticated user's profile |
| GET | `/api/users/` | Yes | Look up a user by the `phoneNumber` request header |

#### Expenses & Balances — `routes/expenseRouter.ts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/expense/create` | Yes | Create an expense and auto-generate settling transactions |
| GET | `/api/expense/` | Yes | List expenses where the current user appears in `userSpent` |
| POST | `/api/expense/get/` | Yes | Get a single expense by ID (passed in the request body) |
| POST | `/api/expense/streak` | Yes | Get the current consecutive-day transaction streak with a friend |
| GET | `/api/balance` | Yes | Get overall incoming/outgoing balance across all friends |
| POST | `/api/balance/friend` | Yes | Get net balance with one specific friend |
| GET | `/api/friends` | Yes | List friends, most recent activity first |
| POST | `/api/friend/expenses` | Yes | List expense IDs shared with a specific friend |

#### Not currently active

`routes/transactionRouter.ts` defines `POST /api/transaction/create`, but the router is never imported or mounted in `index.ts`, so this endpoint doesn't exist on a running server today.

## Known Limitations

- **JWT secret is hardcoded in source** rather than read from the `JWT_SECRET` env var that's already defined in `.env.example` (see [middlewares/authMiddleware.ts](middlewares/authMiddleware.ts) and [routes/authRouter.ts](routes/authRouter.ts)). This should be moved to `process.env.JWT_SECRET` before any real or public deployment.
- **`/api/signin` contains a hardcoded developer shortcut** that issues a valid session token for one specific account without going through OTPless verification. This should be removed before the app is exposed publicly.
- **The real OTPless verification path is unfinished**: `getPhoneNumber` in [routes/authRouter.ts](routes/authRouter.ts) sends placeholder literals instead of the real token/client credentials it reads, and doesn't return its network request. As a result, sign-in for anyone other than the hardcoded bypass above does not currently work.
- Auth uses a custom `x-auth-token` header instead of the more conventional `Authorization: Bearer <token>`.
- `routes/transactionRouter.ts` is dead code — it's never mounted in `index.ts`.
- No automated test suite or CI pipeline.
- `.DS_Store` is currently committed to the repo; worth adding to `.gitignore`.

## License

ISC
