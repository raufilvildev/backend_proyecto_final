import db from "../config/db.config";
const selectRandomNumberById = async (
	user_id: number,
): Promise<{ random_number: string }[]> => {
	const [result] = await db.query(
		"SELECT random_number FROM user WHERE id = ?",
		[user_id],
	);
	return result as { random_number: string }[];
};

const Authentication = { selectRandomNumberById };
export default Authentication;
