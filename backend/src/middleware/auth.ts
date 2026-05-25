import { env } from "@/lib/env.js";
import type { AuthUser } from "@/types/express.js";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = env.JWT_SECRET;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = decoded as AuthUser;
    next();
  });
};
