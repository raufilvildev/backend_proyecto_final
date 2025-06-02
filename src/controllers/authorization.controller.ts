import type { RequestHandler } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import User, { selectBy, selectPasswordById } from "../models/user.model";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import fs from "node:fs/promises";
import path from "node:path";
import Authentication from "../models/authorization.model";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/authorization.util";
import type { IUser } from "../interfaces/iuser.interface";

dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, PRIVATE_KEY } = process.env;

if (!PRIVATE_KEY) {
	throw new Error("PRIVATE_KEY not defined in .env");
}

export const checkToken: RequestHandler = async (req, res) => {
	const token = req.headers.authorization;
	const INVALID_TOKEN_MESSAGE = "Token de autenticación inválido";

	if (!token) {
		res.status(401).json(INVALID_TOKEN_MESSAGE);
		return;
	}
	try {
		const payload = jwt.verify(token, PRIVATE_KEY as string) as JwtPayload;
		const { user_id, email_confirmed } = payload;

		const result = await User.selectBy("id", user_id);
		if (result.length === 0) {
			res.status(401).json(INVALID_TOKEN_MESSAGE);
			return;
		}
		res.status(200).json({ user_id, email_confirmed });
		return;
	} catch (error) {
		res.status(401).json(INVALID_TOKEN_MESSAGE);
		return;
	}
};

export const checkRandomNumberInput: RequestHandler = async (req, res) => {
	const { user_id, random_number_input } = req.body;

	try {
		const resultSelectRandomNumberById =
			await Authentication.selectRandomNumberById(user_id);
		if (
			Array.isArray(resultSelectRandomNumberById) &&
			resultSelectRandomNumberById.length === 0
		) {
			res.status(404).json("User not found.");
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
		res
			.status(500)
			.json("Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.");
	}
};

export const requestConfirmationByEmail: RequestHandler = async (req, res) => {
	const { user_id, type } = req.body;

	if (!["signup", "change_password"].includes(type)) {
		res.status(401).json("Unknown request to confirm by email.");
		return;
	}

	const result = await User.selectBy("id", user_id);

	if (result.length === 0) {
		res.status(404).json("User not found.");
		return;
	}

	const { email } = result[0];

	try {
		const random_number: string = String(
			Math.floor(Math.random() * 1000000),
		).padStart(6, "0");

		const result = await User.updateRandomNumber(user_id, random_number);

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
			subject: "XXX - Confirmación por correo electrónico",
			html: html,
		});
		res.status(200).json({ message: "Correo enviado correctamente." });
	} catch (error) {
		res
			.status(500)
			.json("Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.");
	}
};

export const resetRandomNumber: RequestHandler = async (req, res) => {
	const { user_id } = req.body;
	try {
		const result = await User.updateRandomNumber(user_id, "");
		res.json(result);
	} catch (error) {
		res
			.status(500)
			.json("Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.");
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
			await selectPasswordById(user_id);

		if (!bcrypt.compareSync(password, resultSelectPasswordById.password)) {
			res.status(401).json(INVALID_LOGIN_MESSAGE);
			return;
		}

		const [user]: IUser[] = await selectBy("id", user_id);
		const { email_confirmed } = user;
		const token = generateToken({ user_id, email_confirmed });

		res.json({ token });
	} catch (error) {
		res
			.status(500)
			.json("Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.");
	}
};

export const returnToken: RequestHandler = async (req, res) => {
	const token = generateToken(req.body);
	res.json({ token });
};
