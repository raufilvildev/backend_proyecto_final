import db from '../config/db.config';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

dotenv.config();
const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

export const selectById = async (user_id: number): Promise<any> => {
    const [ result ] = await db.query('SELECT id, name, birth_date, gender, phone, email, username FROM user WHERE id = ?', [ user_id ]);
    const user = result as any[];
    if (user.length === 0) {
        return { error: "User not found." }
    }
    return user[0];
}

export const selectIsConfirmedEmailById = async (user_id: number): Promise<any> => {
    const [ result ] = await db.query('SELECT is_confirmed_email FROM user WHERE id = ?', [ user_id ]);
    const is_confirmed_email = result as any[];
    if (is_confirmed_email.length === 0) {
        return { error: "User not found." }
    }
    return is_confirmed_email[0];
}

export const selectToken = async (user_id: number): Promise<any> => {
    const [ result ] = await db.query('SELECT token FROM user WHERE id = ?', [ user_id ]);
    const token = result as any[];
    if (token.length === 0) {
        return { error: "User not found." }
    }
    return token[0];
}

export const insert = async ({ name, birth_date, gender, phone, email, username, password }: any): Promise<any> => {
    const created_at = new Date();
    const updated_at = created_at;

    const [ result ] = await db.query(`
        INSERT INTO user (name, birth_date, gender, phone, email, username, password, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
    , [ name, birth_date, gender, phone, email, username, bcrypt.hashSync(password,8), created_at, updated_at ]);
    return result;
}

export const updateToken = async (token: string, user_id: number): Promise<any> => {
    const [ result ] = await db.query('UPDATE user SET token = ? WHERE id = ?', [ token, user_id ])
    return result;
}

export const resetToken = async (user_id: number): Promise<any> => {
    const [ result ] = await db.query('UPDATE user SET token = ? WHERE id = ?', [ '', user_id ]);
    return result;
}

export const updateConfirmEmail = async (token_input: string, user_id: number): Promise<any> => {
    const token = await selectToken(user_id);
    
    if (token.error) {
        return token;
    }

    if (token !== token_input) {
        return { error: "Incorrect token." }
    }

    const [ result ] = await db.query('UPDATE user SET token = ?, is_confirmed_email = ?', [ '', 1 ]);
    return result
}

export const updatePassword = async (user_email: string, password: string): Promise<any> => {
    const [ result ] = await db.query('UPDATE user SET password = ? WHERE email = ?', [ password, user_email ]);
    return result;
}

export const deleteUser = async (user_id: number): Promise<any> => {
    const [ result ] = await db.query('DELETE FROM user WHERE id = ?', [ user_id ]);
    return result;
}

export const sendTokenEmail = async (token: string, email: string): Promise<any> => {
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
        secure: SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        }
    });
        
    (async () => {
        const info = await transporter.sendMail({
            from: SMTP_USER,
            to: (typeof email === 'string') ? email : '',
            subject: "XXX - Confirmación del correo electrónico",
            text: "",
            html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: black; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background-color: #fafafa;">
                    <div style="text-align: center;">
                        <h1 style="color: black;">Bienvenido a XXX</h1>
                    </div>
                    <p>Hola,</p>
                    <p>Gracias por registrarte en nuestra plataforma. Para confirmar tu correo electrónico, por favor utiliza el siguiente código:</p>
                    <div style="text-align: center; margin: 24px 0;">
                        <span style="font-size: 2em; font-weight: bold; background-color: #e6f0ff; padding: 12px 24px; border-radius: 8px; display: inline-block; color:black;">${token}</span>
                    </div>
                    <p>Si no solicitaste este registro, puedes ignorar este mensaje.</p>
                    <p style="margin-top: 32px;">Saludos,<br><strong>El equipo de XXX</strong></p>
                </div>
            `
        });
    })();
}