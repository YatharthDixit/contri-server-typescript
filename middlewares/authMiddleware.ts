import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: string; // Assuming 'id' is a string
  token?: string;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({ msg: "No Auth token, Access Denied" });

    const isVerified = jwt.verify(token, "C0nt1Bi11") as { id: string };

    if (!isVerified)
      return res
        .status(401)
        .json({ msg: "Token Verification Failed, Authorization Denied." });

    req.user = isVerified.id;
    req.token = token;
    next();
  } catch (e) {
    res.status(500).json({ error: e + "HELLOO" });
  }
};

export { AuthRequest, authMiddleware };
