export interface IUser {
	id?: number;
	first_name: string;
	last_name: string;
	gender: string;
	birth_date: Date | string;
	email: string;
	username: string;
	password?: string;
	email_confirmed?: boolean;
}
