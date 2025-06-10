import { RequestHandler } from "express";
import { randomUUID } from "crypto";

export const generateUuid: RequestHandler = (req, res, next) => {
  req.body.uuid = randomUUID();
  next();
};
