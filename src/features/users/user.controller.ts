import type { Request, Response } from "express";
import User from "../users/user.model";
import { generateToken } from "../../shared/utils/authorization.util";
import bcrypt from "bcryptjs";
import { IUser } from "../../interfaces/iuser.interface";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { decrypt } from "../../shared/utils/crypto.util";

export const getByUuid = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
    return;
  }

  if (!req.user.email) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
    return;
  }

  req.user.email = decrypt(req.user.email);
  res.json(req.user);
};

export const create = async (req: Request, res: Response) => {
  try {
    const result = await User.insert(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  const INVALID_LOGIN_MESSAGE = "El usuario o la contraseña no son correctos.";

  const { username, password } = req.body;

  try {
    const result = await User.selectBy("username", username);

    if (result.length === 0) {
      res.status(404).json(INVALID_LOGIN_MESSAGE);
      return;
    }

    const user_uuid: string = result[0].uuid;
    const [resultSelectPasswordById]: { password: string }[] =
      await User.selectPasswordByUuid(user_uuid);

    if (!bcrypt.compareSync(password, resultSelectPasswordById.password)) {
      res.status(401).json(INVALID_LOGIN_MESSAGE);
      return;
    }

    const [user]: IUser[] = await User.selectBy("uuid", user_uuid);
    const { email_confirmed, role } = user;
    const token = generateToken({ user_uuid, email_confirmed, role });

    res.json({ token });
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const { uuid } = req.user as IUser;
  const user_uuid = uuid;
  try {
    const result = await User.updatePassword(user_uuid, password);

    if (result.error) {
      throw new Error(result.error);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};

export const remove = async (req: Request, res: Response) => {
  const { uuid } = req.user as IUser;
  const user_uuid: string = uuid;
  try {
    const result = await User.deleteUser(user_uuid);

    if (typeof result === "object" && "error" in result) {
      throw new Error(result.error);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};
