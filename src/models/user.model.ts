import db from '../config/db.config';

export const insert = async ({ name, birth_date, gender, phone, email, username, password, token }: any): Promise<any> => {
    const created_at = new Date();
    const updated_at = created_at;
    const [ result ] = await db.query(`
        INSERT INTO user (name, birth_date, gender, phone, email, username, password, created_at, updated_at, token ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
    , [ name, birth_date, gender, phone, email, username, password, created_at, updated_at, token ]);
    return result;
}

export const updatePassword = async (user_email: string, password: string) => {
    const [ result ] = await db.query('UPDATE user SET password = ? WHERE email = ?', [password, user_email]);
    return result;
}

export const deleteUser = async (user_id: number) => {
    const [ result ] = await db.query('DELETE FROM user WHERE id = ?', [ user_id ]);
    return result;
}