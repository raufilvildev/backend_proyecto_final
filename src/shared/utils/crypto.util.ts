import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const { ENCRYPTION_KEY, ENCRYPTION_IV } = process.env;

if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
  throw new Error("ENCRYPTION_KEY and / or ENCRYPTION_IV not defined in .env");
}

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex"); // 32 bytes
const iv = Buffer.from(process.env.ENCRYPTION_IV!, "hex"); // 16 bytes

export const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};
