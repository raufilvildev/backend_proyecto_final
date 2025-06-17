import { RequestHandler } from "express";
import { IUser } from "interfaces/iuser.interface";

export const teacherRoleCheck: RequestHandler = (req, res, next) => {
  const user = req.user as IUser;
  if (user && (user.role === "general" || user.role === "student")) {
    res.status(403).json({
      message:
        "Usuarios con rol 'general' o 'student' no pueden crear o modificar cursos'",
    });
    return;
  }
  next();
};
