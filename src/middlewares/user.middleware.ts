import type { NextFunction, Request, RequestHandler, Response } from "express";
import User from "../models/user.model";

const paramsDictionary: Record<string, string> = {
  id: "id",
  username: "nombre de usuario",
  email: "correo electrónico"
}

const GENERAL_SERVER_ERROR_MESSAGE = "Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.";

export const checkUserExists = (params: string[], positiveAnswer: boolean = false) => {
  if (!Array.isArray(params) || params.length === 0) {
    throw new Error("params must be a non-empty array.");
  }

  if (params.some(param => !["id", "email", "username"].includes(param))) {
    throw new Error("id, email and username are the only allowed parameters.");
  }
  
  return async (req: Request,res: Response,next: NextFunction) => {
    
    let result;
    for (const param of params) {
      try {
        result = await User.selectBy(param, req.body[param]);

      if (!Array.isArray(result)) {
        res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
        return
      }

      if (!positiveAnswer && result.length > 0) {
        res.status(409).json(`Ya existe un usuario registrado con ese ${paramsDictionary[param]}.`);
        return;
      }

      if (positiveAnswer && result.length === 0) {
        res.status(404).json(`No existe ningún usuario registrado con ese ${paramsDictionary[param]}.`);
        return;
      }
      } catch (error) {
        res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
        return;
      }
      
    }

    if (positiveAnswer) {
      req.body = result;
    }

    next();
  }
}