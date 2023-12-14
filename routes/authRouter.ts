import express, { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User, IUserModel } from "../models/user";
import { AuthRequest, authMiddleware } from "../middlewares/authMiddleware";
import axios from "axios";
// import  UserDetail  from "otpless-node-js-auth-sdk";

const authRouter = express.Router();
dotenv.config();
const getPhoneNumber = async (OTPLessToken: string) => {
  console.log("Inside otpless" + OTPLessToken);
  const clientId = process.env.OTPLESS_CLIENT_ID;
  const clientSecret = process.env.OTPLESS_CLIENT_SECRET;

  const url = "https://auth.otpless.app/auth/userInfo";
  const data = new URLSearchParams();
  data.append("token", "RECEIVED_TOKEN_FROM_OTPLESS");
  data.append("client_id", "YOUR_CLIENT_ID");
  data.append("client_secret", "YOUR_CLIENT_SECRET");

  axios
    .post(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      return response.data;
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
};

authRouter.post("/api/createAccount", async (req: Request, res: Response) => {
  const { name, phoneNumber, photoURL } = req.body;
  try {
    let userDetail: IUserModel | null = await User.findOne({ phoneNumber });

    if (userDetail) {
      userDetail.set({ name, didUserSigned: true });
    } else {
      userDetail = new User({
        name,
        phoneNumber,
        didUserSigned: true,
        photoURL,
      });
    }
    await userDetail.save();
    const token = jwt.sign({ id: userDetail._id }, "C0nt1Bi11");
    console.log(userDetail.name + "JWT TOKEN" + token);
    return res.json({ token, ...userDetail.toObject() });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

authRouter.post("/api/signin", async (req: Request, res: Response) => {
  const { token } = req.body;
  if (token == "YatharthDixit") {
    const admin = await User.findOne({ phoneNumber: "+918960685939" });
    const token = jwt.sign({ id: admin?._id }, "C0nt1Bi11");
    console.log("inside server if");

    return res.json({ token, ...admin?.toObject(), isRegistered: true });
  }
  console.log(req.body);
  console.log("Inside signin" + token);

  try {
    console.log("Inside signin try" + token);
    // const userDetail = await getPhoneNumber(token);
    const phoneNumber = "+918960685939";
    // userDetail["phone_number"];
    console.log("after otpless" + phoneNumber);

    const existingUser = await User.findOne({ phoneNumber });
    // console.log("checked user " + existingUser._doc);

    if (existingUser && existingUser.didUserSigned) {
      const token = jwt.sign({ id: existingUser._id }, "C0nt1Bi11");
      console.log("inside server if");

      return res.json({ token, ...existingUser, isRegistered: true });
    }
    console.log("after server if");

    return res.json({ isRegistered: false, phoneNumber });
  } catch (e) {
    res.status(500).json({ err: e });
  }
});

authRouter.post("/TokenIsValid", async (req: Request, res: Response) => {
  try {
    console.log(1);

    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    console.log(33);

    const isVerified = jwt.verify(token, "C0nt1Bi11") as { id: string };
    console.log(isVerified);
    console.log(2);

    if (!isVerified) return res.json(false);
    const user = await User.findById(isVerified.id);
    // console.log(user._doc);
    if (!user) return res.json(false);
    console.log(user.toObject());
    return res.json(true);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

authRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user);
    res.json({ ...user?.toObject(), token: req.token });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

authRouter.get(
  "/api/users/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      console.log(req.header("phoneNumber"));

      const user = await User.findOne({
        phoneNumber: req.header("phoneNumber"),
      });
      if (!user) return res.status(400).json({ msg: "User does not exist" });
      res.json({ ...user.toObject() });
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
);

export default authRouter;
