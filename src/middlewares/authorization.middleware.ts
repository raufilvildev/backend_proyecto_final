import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model";

dotenv.config();

const { PRIVATE_KEY } = process.env;

if (!PRIVATE_KEY) {
	throw new Error("PRIVATE_KEY not defined in .env");
}

export const checkAuthorization: RequestHandler = async (req, res, next) => {
	const token = req.headers.authorization;
	const INVALID_TOKEN_MESSAGE = "Token de autenticación inválido";

	if (!token) {
		res.status(401).json(INVALID_TOKEN_MESSAGE);
		return;
	}
	try {
		const payload = jwt.verify(token, PRIVATE_KEY as string) as JwtPayload;
		const { user_id } = payload;

		const result = await User.selectBy("id", user_id);
		if (result.length === 0) {
			res.status(401).json(INVALID_TOKEN_MESSAGE);
			return;
		}

		req.body.user_id = user_id;
		next();
	} catch (error) {
		res.status(401).json(INVALID_TOKEN_MESSAGE);
		return;
	}
};
