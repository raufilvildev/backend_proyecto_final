import { RequestHandler } from "express";

export const generateUuid: RequestHandler = (req, res, next) => {
  req.body.uuid = crypto.randomUUID();
  next();
};
