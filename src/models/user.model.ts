import db from '../config/db.config';

export const insert = async ({ name, birth_date, gender, phone, email, username, password }: any): Promise<any> => {
    const created_at = new Date();
    const updated_at = created_at;
    const [ result ] = await db.query(`
        INSERT INTO user (name, birth_date, gender, phone, email, username, password, created_at, updated_at ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
    , [ name, birth_date, gender, phone, email, username, password, created_at, updated_at ]);
    return result;
}

export const updatePassword = async (user_id: string, password: string) => {
    const [ result ] = await db.query('UPDATE user SET password = ? WHERE id = ?', [password, user_id]);
    return result;
}