import { RequestHandler } from "express";
import { IUser } from "interfaces/iuser.interface";

export const generalRoleCheck: RequestHandler = (req, res, next) => {
  const user = req.user as IUser;
  if (user && user.role === "general") {
    res.status(403).json({
      message: "Usuario con rol 'general' no tienen acceso",
    });
    return;
  }
  next();
};
