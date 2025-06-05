import type { RequestHandler } from "express";
import User from "../users/user.model";
import { generateToken } from "../../shared/utils/authorization.util";
import bcrypt from "bcryptjs";
import { IUser } from "../../interfaces/iuser.interface";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";

export const getById: RequestHandler = async (req, res) => {
  res.json(req.body);
};

export const create: RequestHandler = async (req, res) => {
  try {
    const result = await User.insert(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};

export const login: RequestHandler = async (req, res) => {
  const INVALID_LOGIN_MESSAGE = "El usuario o la contraseña no son correctos.";

  const { username, password } = req.body;

  try {
    const result = await User.selectBy("username", username);

    if (result.length === 0) {
      res.status(404).json(INVALID_LOGIN_MESSAGE);
      return;
    }

    const user_id: number = result[0].id as number;
    const [resultSelectPasswordById]: { password: string }[] =
      await User.selectPasswordById(user_id);

    if (!bcrypt.compareSync(password, resultSelectPasswordById.password)) {
      res.status(401).json(INVALID_LOGIN_MESSAGE);
      return;
    }

    const [user]: IUser[] = await User.selectBy("id", user_id);
    const { email_confirmed, role } = user;
    const token = generateToken({ user_id, email_confirmed, role });

    res.json({ token });
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
  }
};

export const changePassword: RequestHandler = async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const result = await User.updatePassword(user_id, password);

    if (result.error) {
      throw new Error(result.error);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};

export const remove: RequestHandler = async (req, res) => {
  const { user_id } = req.body;
  try {
    const result = await User.deleteUser(user_id);

    if (typeof result === "object" && "error" in result) {
      throw new Error(result.error);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};
