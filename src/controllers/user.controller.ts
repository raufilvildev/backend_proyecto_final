import type { RequestHandler } from "express";
import User from "../models/user.model";

export const getById: RequestHandler = async (req, res) => {
	const { user_id } = req.params;
	try {
		const result = await User.selectBy("id", Number(user_id));
		if (Array.isArray(result) && result.length === 0) {
			res.status(404).json("User not found.");
			return;
		}
		res.json(result[0]);
	} catch (error) {}
};

export const create: RequestHandler = async (req, res) => {
	try {
		const result = await User.insert(req.body);

		if (result.error) {
			res.status(409).json(result.error);
			return;
		}

		res.status(201).json(result);
	} catch (error) {
		res.status(500).json(error);
	}

	return;
};

export const changePassword: RequestHandler = async (req, res) => {
	const { user_id, password } = req.body;
	try {
		const result = await User.updatePassword(user_id, password);
		if (result.error) {
			res.status(409).json(result.error);
			return;
		}

		res.json(result);
	} catch (error) {
		res.status(500).json(error);
	}

	return;
};
