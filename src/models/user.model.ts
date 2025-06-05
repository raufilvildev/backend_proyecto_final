import db from "../config/db.config";
import type { IUser } from "../interfaces/iuser.interface";
import dayjs from "dayjs";
import bcrypt from "bcryptjs";
import type { ResultSetHeader } from "mysql2";
import { generateToken } from "../utils/authorization.util";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../utils/constants.util";

export const selectBy = async (
  field: string,
  value: string | number
): Promise<IUser[]> => {
  if (!["id", "email", "username"].includes(field)) {
    throw new Error(
      "Los campos de búsqueda permitidos son id, email y username."
    );
  }

  const [result] = await db.query(
    `SELECT id, first_name, last_name, birth_date, email, username, email_confirmed, role FROM users WHERE ${field} = ?`,
    [value]
  );

  return result as IUser[];
};

export const selectPasswordById = async (
  user_id: number
): Promise<{ password: string }[]> => {
  const [result] = await db.query("SELECT password FROM users WHERE id = ?", [
    user_id,
  ]);
  return result as { password: string }[];
};

export const insert = async ({
  first_name,
  last_name,
  birth_date,
  email,
  username,
  password,
  role = "general",
}: IUser) => {
  try {
    const result = await db.query(
      `
    INSERT INTO users (first_name, last_name, birth_date, email, username, password, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        birth_date,
        email,
        username,
        bcrypt.hashSync(password as string, 8),
        role,
      ]
    );

    if (!Array.isArray(result) || !result[0]) {
      throw new Error(GENERAL_SERVER_ERROR_MESSAGE);
    }

    const insertResult = result[0] as ResultSetHeader;
    const user_id = insertResult.insertId;
    const token = generateToken({ user_id, email_confirmed: 0, role });

    return { token };
  } catch (error) {
    return { error };
  }
};

export const updateRandomNumber = async (
  user_id: number,
  random_number: string | null
) => {
  try {
    const [result] = await db.query(
      `
    UPDATE users 
    SET random_number = ? WHERE id = ?
    `,
      [random_number, user_id]
    );
    return result;
  } catch (error) {
    return {
      error: GENERAL_SERVER_ERROR_MESSAGE,
    };
  }
};

export const updateEmailConfirmedById = async (user_id: number) => {
  try {
    const [result] = await db.query(
      `
    UPDATE users 
    SET email_confirmed = ? WHERE id = ?
    `,
      [1, user_id]
    );
    return result;
  } catch (error) {
    return {
      error: GENERAL_SERVER_ERROR_MESSAGE,
    };
  }
};

export const updatePassword = async (user_id: number, password: string) => {
  try {
    await db.query(
      "UPDATE users SET password = ?, updated_at = ? WHERE id = ?",
      [
        bcrypt.hashSync(password, 8),
        dayjs().format("YYYY-MM-DD HH:mm:ss"),
        user_id,
      ]
    );

    const [user] = await selectBy("id", user_id);
    const { email_confirmed, role } = user;

    const token = generateToken({
      user_id,
      email_confirmed,
      role,
    });
    return { token };
  } catch (error) {
    return { error: GENERAL_SERVER_ERROR_MESSAGE };
  }
};

export const deleteUser = async (user_id: number) => {
  try {
    const result = await db.query("DELETE FROM users WHERE id = ?", [user_id]);
    return result;
  } catch (error) {
    return {
      error: GENERAL_SERVER_ERROR_MESSAGE,
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
  deleteUser,
};
export default User;
