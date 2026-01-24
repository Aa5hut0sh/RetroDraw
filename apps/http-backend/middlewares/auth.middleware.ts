import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "my-secret";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing or malformed" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (decoded.id) {
      req.userId = decoded.id;
      next();
    } else {
      return res.status(400).json({
        success: false,
        message: "Unauthorised",
      });
    }
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};