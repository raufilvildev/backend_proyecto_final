import type { Request, Response } from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import fs from "node:fs/promises";
import path from "node:path";
import Authorization from "../authorization/authorization.model";
import User from "../users/user.model";
import { generateToken } from "../../shared/utils/authorization.util";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";
import { decrypt } from "../../shared/utils/crypto.util";

dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, PRIVATE_KEY } = process.env;

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY not defined in .env");
}

export const checkRandomNumberInput = async (req: Request, res: Response) => {
  const { random_number_input } = req.body;
  const { uuid, role } = req.user as IUser;
  const user_uuid = uuid;

  try {
    const resultSelectRandomNumberByUuid =
      await Authorization.selectRandomNumberByUuid(user_uuid);

    if (!Array.isArray(resultSelectRandomNumberByUuid)) {
      res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
      return;
    }

    if (resultSelectRandomNumberByUuid.length === 0) {
      res.status(404).json("No existe ningún usuario con ese identificador.");
      return;
    }

    const random_number = resultSelectRandomNumberByUuid[0].random_number;

    if (random_number !== random_number_input) {
      res.status(401).json("El código introducido es incorrecto.");
      return;
    }

    await User.updateEmailConfirmedByUuid(user_uuid);
    await User.updateRandomNumber(user_uuid, null);

    const token = generateToken({ user_uuid, email_confirmed: 1, role });

    res.json({ token });
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
    return;
  }
};

export const requestConfirmationByEmail = async (
  req: Request,
  res: Response
) => {
  const { type } = req.params;

  const { uuid, email } = req.user as IUser;
  const user_uuid = uuid;

  if (!["signup", "change_password"].includes(type)) {
    res
      .status(401)
      .json(
        "El parámetro type solo puede tomar los valores 'signup' o 'change_password'."
      );
    return;
  }

  try {
    const random_number: string = String(
      Math.floor(Math.random() * 1000000)
    ).padStart(6, "0");

    await User.updateRandomNumber(user_uuid, random_number);

    const options: SMTPTransport.Options = {
      host: SMTP_HOST as string,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER as string,
        pass: SMTP_PASS as string,
      },
    };

    const transporter = nodemailer.createTransport(options);

    const templatePath = path.join(
      __dirname,
      "../../shared/templates",
      `${type}.html`
    );

    let html = await fs.readFile(templatePath, "utf-8");
    html = html.replace("$$random_number$$", `${random_number}`);

    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: decrypt(email),
      subject: "Taskly - Confirmación por correo electrónico",
      html: html,
    });

    res.status(200).json({ message: "Correo enviado correctamente." });
  } catch (error) {
    console.log(error);
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
  }
};

export const resetRandomNumber = async (req: Request, res: Response) => {
  const { uuid } = req.user as IUser;
  const user_uuid = uuid;
  try {
    await User.updateRandomNumber(user_uuid, null);
    res.json({ message: "El código ha sido reseteado correctamente." });
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
  }
};

export const returnToken = async (req: Request, res: Response) => {
  const { uuid, email_confirmed, role } = req.user as IUser;
  const user_uuid: string = uuid;
  const token = generateToken({ user_uuid, email_confirmed, role });
  res.json({ token });
};
