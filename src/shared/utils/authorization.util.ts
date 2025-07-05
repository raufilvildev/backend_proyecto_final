import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { PRIVATE_KEY } = process.env;

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY not defined in .env");
}

export const generateToken = (payload: object) => {
  const token = jwt.sign(payload, PRIVATE_KEY);
  return token;
};
