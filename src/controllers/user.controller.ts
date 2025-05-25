import { Request, Response } from 'express';
import * as User from '../models/user.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const { PRIVATE_KEY } = process.env;

export const getById = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const user = await User.selectById(Number(user_id));
    if (user.error) {
        return res.status(404).json(user);
    }
    res.json(user);
}

export const getIsConfirmedEmailById = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const is_confirmed_email = await User.selectIsConfirmedEmailById(Number(user_id));
    if (is_confirmed_email.error) {
        return res.status(404).json(is_confirmed_email);
    }
    return res.json(is_confirmed_email);
}

export const create = async (req: Request, res: Response): Promise<any> => {
    const result = await User.insert(req.body);
    req.body.id = result.insertId;
    const user = req.body;
    return res.json({user, insert_response: result});
}

export const editToken = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const user = await User.selectById(Number(user_id));
    
    if (user.error) {
        return res.status(404).json(user);
    }

    const email = user.email;
    const token: string = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    await User.sendTokenEmail(token, email);
    const result = await User.updateToken(token, Number(user_id));
    return res.json(result);
};

export const removeToken = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const result = await User.resetToken(Number(user_id));
    return res.json(result);
}

export const editConfirmEmail = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const { token_input } = req.body;
    const result = await User.updateConfirmEmail(token_input, Number(user_id));
    
    if (result.error) {
        return res.status(404).json(result);
    }
    const user = await User.selectById(Number(user_id));
    const token = jwt.sign(user, PRIVATE_KEY as string);
    return res.json({ token, result });
}

export const editPassword = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const { password } = req.body;
    const result = await User.updatePassword(user_id, password);
    return res.json(result);
}

export const remove = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const result = await User.deleteUser(Number(user_id));
    return res.json(result);
}