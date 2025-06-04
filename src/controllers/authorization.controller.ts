import type { RequestHandler } from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import fs from "node:fs/promises";
import path from "node:path";
import Authorization from "../models/authorization.model";
import User from "../models/user.model";
import { generateToken } from "../utils/authorization.util";

dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, PRIVATE_KEY } = process.env;

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY not defined in .env");
}

const GENERAL_SERVER_ERROR_MESSAGE =
  "Ha ocurrido un error inesperado. Vuelva a intentarlo más tarde.";

export const checkRandomNumberInput: RequestHandler = async (req, res) => {
  const { user_id, random_number_input } = req.body;

  try {
    const resultSelectRandomNumberById =
      await Authorization.selectRandomNumberById(user_id);

    if (!Array.isArray(resultSelectRandomNumberById)) {
      res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
      return;
    }

    if (resultSelectRandomNumberById.length === 0) {
      res.status(404).json("No existe ningún usuario con ese identificador.");
      return;
    }

    const random_number = resultSelectRandomNumberById[0].random_number;

    if (random_number !== random_number_input) {
      res.status(401).json("El código introducido es incorrecto.");
      return;
    }

    await User.updateEmailConfirmedById(user_id);
    await User.updateRandomNumber(user_id, "");

    const token = generateToken({ user_id, email_confirmed: 1 });

    res.json({ token });
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
    return;
  }
};

export const requestConfirmationByEmail: RequestHandler = async (req, res) => {
  const { type } = req.params;

  const { user_id, email } = req.body;

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

    await User.updateRandomNumber(user_id, random_number);

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

    const templatePath = path.join(__dirname, "../templates", `${type}.html`);

    let html = await fs.readFile(templatePath, "utf-8");
    html = html.replace("$$random_number$$", `${random_number}`);

    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: email,
      subject: "Taskly - Confirmación por correo electrónico",
      html: html,
    });

    res.status(200).json({ message: "Correo enviado correctamente." });
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
  }
};

export const resetRandomNumber: RequestHandler = async (req, res) => {
  const { user_id } = req.body;
  try {
    await User.updateRandomNumber(user_id, "");
    res.json({ message: "El código ha sido reseteado correctamente." });
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
  }
};

export const returnToken: RequestHandler = async (req, res) => {
  const { user_id, email_confirmed } = req.body;
  const token = generateToken({ user_id, email_confirmed });
  res.json({ token });
};
