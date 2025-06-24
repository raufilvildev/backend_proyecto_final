import type { Request, Response } from "express";
import User from "../users/user.model";
import { generateToken } from "../../shared/utils/authorization.util";
import bcrypt from "bcryptjs";
import { IUser } from "../../interfaces/iuser.interface";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { decrypt } from "../../shared/utils/crypto.util";
import fs from "node:fs";
import path from "node:path";

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

export const getByEmail = async (req: Request, res: Response) => {
  const { user_email } = req.params;
  try {
    const result = await User.selectBy("email", user_email);

    if (result.length === 0) {
      res
        .status(404)
        .json(
          "No existe ningún usuario general o estudiante con ese correo electrónico."
        );
      return;
    }

    const user = result[0];

    if (user.role === "teacher") {
      res
        .status(404)
        .json(
          "No existe ningún usuario general o estudiante con ese correo electrónico."
        );
      return;
    }

    user.email = decrypt(user.email);

    res.json(user);
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
  }
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

export const edit = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  let newName = "";

  if (req.file) {
    const extension = req.file.mimetype.split("/")[1] || "";
    newName = `${req.file.filename}.${extension}`;

    // Renombrar el archivo subido
    if (req.file.path) {
      fs.renameSync(req.file.path, `./public/uploads/users/${newName}`);
    }

    // Eliminar imagen anterior si existe
    const profile_image_url = user.profile_image_url;

    if (profile_image_url && profile_image_url !== "default_user_profile.svg") {
      const profile_image_complete_path = path.resolve(
        "public/uploads/users",
        profile_image_url
      );

      try {
        fs.unlinkSync(profile_image_complete_path);
      } catch (error: any) {
        console.warn("No se pudo borrar la imagen anterior: ", error.message);
      }
    }

    req.body.profile_image_url = newName;
  }

  // Actualizar la nueva ruta en el body

  const user_uuid: string = user.uuid;

  try {
    const result = await User.update(user_uuid, req.body);

    if (typeof result === "object" && "error" in result) {
      throw new Error(result.error);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json(error);
    return;
  }
};

export const editEmail = async (req: Request, res: Response) => {
  const { uuid } = req.user as IUser;

  const user_uuid: string = uuid;

  try {
    const result = await User.updateEmail(user_uuid, req.body.email);

    if (typeof result === "object" && "error" in result) {
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
