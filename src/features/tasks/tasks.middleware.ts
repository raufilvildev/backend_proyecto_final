import { RequestHandler } from "express";
import { randomUUID } from "crypto";

export const generateUuidForSubtasks: RequestHandler = (req, res, next) => {
  if (!req.body.subtasks || req.body.subtasks.length === 0) {
    return next();
  }

  req.body.subtasks = req.body.subtasks.map((title: string) => ({
    uuid: randomUUID(),
    title,
  }));

  next();
};