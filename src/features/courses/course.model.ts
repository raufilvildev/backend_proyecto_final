import { ICourse } from "../../interfaces/icourse.interface";
import db from "../../config/db.config";

export const selectAll = async (userId: number): Promise<ICourse[]> => {
  const query = `SELECT
    c.uuid,
    c.title,
    c.short_description,
    c.image_url,
    c.teacher_id,
    'teacher' AS user_role_in_course
FROM
    courses c
WHERE
    c.teacher_id = ?
UNION
SELECT
    c.uuid,
    c.title,
    c.short_description,
    c.image.url,
    c.teacher_id,
    'student' AS user_role_in_course
FROM
    courses c
JOIN
    enrollments e ON c.id = e.course_id
WHERE
    e.student_id = ?`;
  const [rows] = await db.query(query, [userId, userId]);
  return rows as ICourse[];
};
