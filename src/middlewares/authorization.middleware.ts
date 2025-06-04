import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model";

dotenv.config();

const PRIVATE_KEY: string = process.env.PRIVATE_KEY
  ? process.env.PRIVATE_KEY
  : "";
const INVALID_TOKEN_MESSAGE = "Token de autenticación inválido";

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY not defined in .env");
}

export const checkToken: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json(INVALID_TOKEN_MESSAGE);
    return;
  }

  try {
    const payload = jwt.verify(token, PRIVATE_KEY) as JwtPayload;
    const { user_id, email_confirmed, role } = payload;

    const result = await User.selectBy("id", user_id);
    if (result.length === 0) {
      res.status(401).json(INVALID_TOKEN_MESSAGE);
      return;
    }

    const [user] = result;

    if (
      user.id !== user_id ||
      user.email_confirmed !== email_confirmed ||
      user.role !== role
    ) {
      res.status(401).json(INVALID_TOKEN_MESSAGE);
      return;
    }

    if (!req.body) req.body = {};

    req.body.user_id = user.id;
    req.body.first_name = user.first_name;
    req.body.last_name = user.last_name;
    req.body.gender = user.gender;
    req.body.birth_date = user.birth_date;
    req.body.email = user.email;
    req.body.username = user.username;
    req.body.role = user.role;

    next();
  } catch (error) {
    res.status(401).json(INVALID_TOKEN_MESSAGE);
    return;
  }
};
