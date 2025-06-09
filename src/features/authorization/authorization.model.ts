import db from "../../config/db.config";

const selectRandomNumberByUuid = async (
  user_uuid: string
): Promise<{ random_number: string }[]> => {
  const [result] = await db.query(
    "SELECT random_number FROM users WHERE uuid = ?",
    [user_uuid]
  );

  return result as { random_number: string }[];
};

const Authentication = { selectRandomNumberByUuid };
export default Authentication;
