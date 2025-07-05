import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../users/user.model";
import { INVALID_TOKEN_MESSAGE } from "../../shared/utils/constants.util";
import dayjs from "dayjs";

dotenv.config();

const PRIVATE_KEY: string = process.env.PRIVATE_KEY
  ? process.env.PRIVATE_KEY
  : "";

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
    const { user_uuid, email_confirmed, role } = payload;

    const result = await User.selectBy("uuid", user_uuid);
    if (result.length === 0) {
      res.status(401).json(INVALID_TOKEN_MESSAGE);
      return;
    }

    const [user] = result;

    if (
      user.uuid !== user_uuid ||
      user.email_confirmed !== email_confirmed ||
      user.role !== role
    ) {
      res.status(401).json(INVALID_TOKEN_MESSAGE);
      return;
    }

    req.user = user;
    req.user.birth_date = dayjs(req.user.birth_date).format("YYYY-MM-DD");

    next();
  } catch (error) {
    res.status(401).json(INVALID_TOKEN_MESSAGE);
    return;
  }
};
