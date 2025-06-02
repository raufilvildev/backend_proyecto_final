import db from "../config/db.config";
import type { IUser } from "../interfaces/iuser.interface";
import dayjs from "dayjs";
import bcrypt from "bcryptjs";
import type { ResultSetHeader } from "mysql2";
import { generateToken } from "../utils/authorization.util";

export const selectBy = async (
	field: string,
	value: string | number,
): Promise<IUser[]> => {
	if (!["id", "email", "username"].includes(field)) {
		throw new Error("Invalid field for user lookup.");
	}

	const [result] = await db.query(
		`SELECT id, first_name, last_name, gender, birth_date, gender, email, username, email_confirmed FROM user WHERE ${field} = ?`,
		[value],
	);

	return result as IUser[];
};

export const selectPasswordById = async (
	user_id: number,
): Promise<{ password: string }[]> => {
	const [result] = await db.query("SELECT password FROM user WHERE id = ?", [
		user_id,
	]);
	return result as { password: string }[];
};

export const insert = async ({
	first_name,
	last_name,
	gender,
	birth_date,
	email,
	username,
	password,
}: IUser) => {
	const created_at = dayjs().format("YYYY-MM-DD HH:mm:ss");
	const updated_at = created_at;
	try {
		const result = await db.query(
			`
    INSERT INTO user (first_name, last_name, gender, birth_date, email, username, password, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				first_name,
				last_name,
				gender,
				birth_date,
				email,
				username,
				bcrypt.hashSync(password as string, 8),
				created_at,
				updated_at,
			],
		);

		if (
			!Array.isArray(result) ||
			typeof result[0] !== "object" ||
			!("insertId" in result[0])
		) {
			throw new Error("Unexpected result from database insert.");
		}

		const insertResult = result[0] as ResultSetHeader;
		const user_id = insertResult.insertId;
		const token = generateToken({
			user_id,
			email_confirmed: 0,
		});
		return { token };
	} catch (error) {
		return {
			error: "Ha habido un error inesperado. Vuelve a intentarlo más tarde.",
		};
	}
};

export const updateRandomNumber = async (
	user_id: number,
	random_number: string,
) => {
	try {
		const [result] = await db.query(
			`
    UPDATE user 
    SET random_number = ? WHERE id = ?
    `,
			[random_number, user_id],
		);
		return result;
	} catch (error) {
		return {
			error: "Ha habido un error inesperado. Vuelve a intentarlo más tarde.",
		};
	}
};

export const updateEmailConfirmedById = async (user_id: number) => {
	try {
		const [result] = await db.query(
			`
    UPDATE user 
    SET email_confirmed = ? WHERE id = ?
    `,
			[1, user_id],
		);
		return result;
	} catch (error) {
		return {
			error: "Ha habido un error inesperado. Vuelve a intentarlo más tarde.",
		};
	}
};

export const updatePassword = async (user_id: number, password: string) => {
	try {
		const result = await db.query(
			"UPDATE user SET password = ?, updated_at = ? WHERE id = ?",
			[
				bcrypt.hashSync(password, 8),
				dayjs().format("YYYY-MM-DD HH:mm:ss"),
				user_id,
			],
		);

		if (!Array.isArray(result) || typeof result[0] !== "object") {
			throw new Error("Unexpected result from database insert.");
		}

		const [user] = await selectBy("id", user_id);
		const { email_confirmed } = user;

		const token = generateToken({
			user_id,
			email_confirmed,
		});
		return { token };
	} catch (error) {
		return {
			error: "Ha habido un error inesperado. Vuelve a intentarlo más tarde.",
		};
	}
};

const User = {
	selectBy,
	selectPasswordById,
	insert,
	updateRandomNumber,
	updateEmailConfirmedById,
	updatePassword,
};
export default User;
