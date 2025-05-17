import { Request, Response } from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { insert, updatePassword } from '../models/user.model';

dotenv.config();
const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

export const generateTokenAndSendEmail = (req: Request, res: Response): any => {
    const { email } = req.query;
    if (!email) {
        return { error: "Email is undefined."}
    }
    const token: string = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
        secure: SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    (async () => {
        const _ = await transporter.sendMail({
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
    return res.send(token);
};

export const create = async (req: Request, res: Response): Promise<any> => {
    const result = await insert(req.body);
    req.body.id = result.insertId;
    const user = req.body;
    return res.json({user, result});
}

export const editPassword = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const { password } = req.body;
    const result = await updatePassword(user_id, password);
    return res.json(result);
}