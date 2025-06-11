import { ICourse } from "../../interfaces/icourse.interface";
import db from "../../config/db.config";

export const selectAll = async (userId: number): Promise<ICourse[]> => {
  const query = `SELECT
    c.uuid,
    c.title,
    c.short_description,
    c.image_url,
    CONCAT(u.first_name, ' ', u.last_name) AS teacher,
    'teacher' AS user_role_in_course
FROM
    courses c
JOIN
    users u ON c.teacher_id = u.id
WHERE
    c.teacher_id = ?
UNION
SELECT
    c.uuid,
    c.title,
    c.short_description,
    c.image_url,
    CONCAT(u.first_name, ' ', u.last_name) AS teacher,
    'student' AS user_role_in_course
FROM
    courses c
JOIN
    enrollments e ON c.id = e.course_id
JOIN
    users u ON c.teacher_id = u.id
WHERE
    e.student_id = ?;`;
  const [rows] = await db.query(query, [userId, userId]);
  return rows as ICourse[];
};
