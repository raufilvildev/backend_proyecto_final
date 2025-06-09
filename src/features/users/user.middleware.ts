import type { NextFunction, Request, Response } from "express";
import User from "../users/user.model";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";
import { decrypt } from "../../shared/utils/crypto.util";

const paramsDictionary: Record<string, string> = {
  uuid: "uuid",
  id: "id",
  username: "nombre de usuario",
  email: "correo electrónico",
};

export const checkUserExists = (
  params: string[],
  positiveAnswer: boolean = false
) => {
  if (!Array.isArray(params) || params.length === 0) {
    throw new Error("params must be a non-empty array.");
  }

  if (
    params.some((param) => !["uuid", "id", "email", "username"].includes(param))
  ) {
    throw new Error(
      "uuid, id, email and username are the only allowed parameters."
    );
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (positiveAnswer) {
        const result = await User.selectBy(params[0], req.body[params[0]]);

        if (!Array.isArray(result)) {
          res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
          return;
        }

        if (result.length === 0) {
          res
            .status(404)
            .json(
              `No existe ningún usuario registrado con ese ${
                paramsDictionary[params[0]]
              }.`
            );
          return;
        }

        const user: IUser = result[0];
        user.email = decrypt(user.email);

        for (const param of params as (keyof IUser)[]) {
          if (req.body[param] !== user[param]) {
            res
              .status(404)
              .json(
                `No existe ningún usuario registrado con ese ${paramsDictionary[param]}.`
              );
            return;
          }
        }

        req.user = user;
      }

      if (!positiveAnswer) {
        for (const param of params) {
          const result = await User.selectBy(param, req.body[param]);

          if (!Array.isArray(result)) {
            res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
            return;
          }

          if (result.length > 0) {
            res
              .status(409)
              .json(
                `Ya existe un usuario registrado con ese ${paramsDictionary[param]}.`
              );
            return;
          }
        }
      }
    } catch (error) {
      res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
      return;
    }

    next();
  };
};
