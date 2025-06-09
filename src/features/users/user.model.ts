import db from "../../config/db.config";
import type { IUser } from "../../interfaces/iuser.interface";
import dayjs from "dayjs";
import bcrypt from "bcryptjs";
import { generateToken } from "../../shared/utils/authorization.util";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { encrypt } from "../../shared/utils/crypto.util";

export const selectBy = async (
  field: string,
  value: string | number
): Promise<IUser[]> => {
  if (!["uuid", "id", "email", "username"].includes(field)) {
    throw new Error(
      "Los campos de búsqueda permitidos son uuid, id, email y username."
    );
  }

  if (field === "email") value = encrypt(value as string);

  const [result] = await db.query(
    `SELECT uuid, id, first_name, last_name, birth_date, email, username, profile_image_url, email_confirmed, role FROM users WHERE ${field} = ?`,
    [value]
  );

  return result as IUser[];
};

export const selectPasswordByUuid = async (
  user_uuid: string
): Promise<{ password: string }[]> => {
  const [result] = await db.query("SELECT password FROM users WHERE uuid = ?", [
    user_uuid,
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
  const user_uuid = crypto.randomUUID();

  try {
    const result = await db.query(
      `
    INSERT INTO users (uuid, first_name, last_name, birth_date, email, username, password, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_uuid,
        first_name,
        last_name,
        birth_date,
        encrypt(email),
        username,
        bcrypt.hashSync(password as string, 8),
        role,
      ]
    );

    if (!Array.isArray(result) || !result[0]) {
      throw new Error(GENERAL_SERVER_ERROR_MESSAGE);
    }

    const token = generateToken({ user_uuid, email_confirmed: 0, role });

    return { token };
  } catch (error) {
    return { error };
  }
};

export const updateRandomNumber = async (
  user_uuid: string,
  random_number: string | null
) => {
  try {
    const [result] = await db.query(
      `
    UPDATE users 
    SET random_number = ? WHERE uuid = ?
    `,
      [random_number, user_uuid]
    );
    return result;
  } catch (error) {
    return {
      error: GENERAL_SERVER_ERROR_MESSAGE,
    };
  }
};

export const updateEmailConfirmedByUuid = async (user_uuid: string) => {
  try {
    const [result] = await db.query(
      `
    UPDATE users 
    SET email_confirmed = ? WHERE uuid = ?
    `,
      [1, user_uuid]
    );
    return result;
  } catch (error) {
    return {
      error: GENERAL_SERVER_ERROR_MESSAGE,
    };
  }
};

export const updatePassword = async (user_uuid: string, password: string) => {
  try {
    await db.query(
      "UPDATE users SET password = ?, updated_at = ? WHERE uuid = ?",
      [
        bcrypt.hashSync(password, 8),
        dayjs().format("YYYY-MM-DD HH:mm:ss"),
        user_uuid,
      ]
    );

    const [user] = await selectBy("uuid", user_uuid);
    const { email_confirmed, role } = user;

    const token = generateToken({
      user_uuid,
      email_confirmed,
      role,
    });
    return { token };
  } catch (error) {
    return { error: GENERAL_SERVER_ERROR_MESSAGE };
  }
};

export const deleteUser = async (user_uuid: string) => {
  try {
    const result = await db.query("DELETE FROM users WHERE uuid = ?", [
      user_uuid,
    ]);
    return result;
  } catch (error) {
    return {
      error: GENERAL_SERVER_ERROR_MESSAGE,
    };
  }
};

const User = {
  selectBy,
  selectPasswordByUuid,
  insert,
  updateRandomNumber,
  updateEmailConfirmedByUuid,
  updatePassword,
  deleteUser,
};
export default User;
