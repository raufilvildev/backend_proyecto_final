import { Request, Response } from 'express';
import { selectById, insert, sendTokenEmail, updateToken, resetToken, updateConfirmEmail, updatePassword, deleteUser } from '../models/user.model';

export const getById = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const [ result ] = await selectById(Number(user_id));
    return res.json(result);
}

export const create = async (req: Request, res: Response): Promise<any> => {
    const result = await insert(req.body);
    req.body.id = result.insertId;
    const user = req.body;
    return res.json({user, insert_response: result});
}

export const editToken = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const [ user ] = await selectById(Number(user_id));
    const email = user.email;
    const token: string = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    await sendTokenEmail(token, email);
    const result = await updateToken(token, Number(user_id));
    return res.json(result);
};

export const removeToken = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const result = await resetToken(Number(user_id));
    return res.json(result);
}

export const editConfirmEmail = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const { token_input } = req.body;
    const result = await updateConfirmEmail(token_input, Number(user_id));
    if (result.error) {
        return res.status(404).json(result);
    }
    return res.json(result);
}

export const editPassword = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const { password } = req.body;
    const result = await updatePassword(user_id, password);
    return res.json(result);
}

export const remove = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const result = await deleteUser(Number(user_id));
    return res.json(result);
}