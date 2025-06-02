import type { RequestHandler } from "express";
import User from "../models/user.model";

export const checkUserExists: RequestHandler = async (req, res, next) => {
	const { email, username } = req.body;

	let result = await User.selectBy("email", email);

	if (Array.isArray(result) && result.length > 0) {
		res.status(409).json("Ya existe un usuario con ese correo electrónico.");
		return;
	}

	result = await User.selectBy("username", username);
	if (Array.isArray(result) && result.length > 0) {
		res.status(409).json("Ya existe un usuario con ese nombre de usuario.");
		return;
	}

	next();
};

export const checkEmailExists: RequestHandler = async (req, res, next) => {
	const { email } = req.body;

	const result = await User.selectBy("email", email);

	if (Array.isArray(result) && result.length === 0) {
		res
			.status(404)
			.json("No existe ningún usuario registrado con ese correo electrónico.");
		return;
	}

	const { id, email_confirmed } = result[0];
	req.body = { user_id: id, email, email_confirmed };
	next();
};
