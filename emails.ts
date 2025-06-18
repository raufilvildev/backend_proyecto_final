// import db from "./src/config/db.config";
// import { encrypt } from "./src/shared/utils/crypto.util";
// import { IUser } from "./src/interfaces/iuser.interface";

// const fixEmails = async () => {
//   console.log("Iniciando la encriptación de emails existentes...");

//   try {
//     const [users] = await db.query("SELECT id, email FROM users");

//     for (const user of users as (IUser & { id: number })[]) {
//       if (user.email.length < 100 && user.email.includes("@")) {
//         console.log(`Encriptando email para el usuario con ID: ${user.id}`);

//         const encryptedEmail = encrypt(user.email);

//         await db.query("UPDATE users SET email = ? WHERE id = ?", [
//           encryptedEmail,
//           user.id,
//         ]);

//         console.log(`Email del usuario ${user.id} actualizado.`);
//       } else {
//         console.log(
//           `El email para el usuario ${user.id} ya parece estar encriptado. Omitiendo.`
//         );
//       }
//     }

//     console.log("¡Proceso completado!");
//   } catch (error) {
//     console.error("Ocurrió un error:", error);
//   } finally {
//     await db.end();
//   }
// };

// fixEmails();
