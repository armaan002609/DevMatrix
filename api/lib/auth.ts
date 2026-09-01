import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export interface JwtPayload {
  userId: string;
  role: "member" | "admin";
}

export const signToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.verify(token, secret) as JwtPayload;
};
