import "dotenv/config";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel";
import { ExtendRequest } from "../types/extendRequest";

// Validate JWT_SECRET exists at startup
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

interface JWTPayload {
  userId: string;
  username: string;
}

const validateJWT = async (
  req: ExtendRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check authorization header
    const authorizationHeader = req.get("authorization");
    if (!authorizationHeader) {
      res.status(401).json({ error: "Authorization header missing" });
      return;
    }

    // Extract token
    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Token not found" });
      return;
    }

    // Verify token
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Find user in database
    const user = await adminModel.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    }

    console.error("JWT validation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default validateJWT;
