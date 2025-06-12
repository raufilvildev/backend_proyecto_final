import { ICourse } from "../../interfaces/icourse.interface";
import db from "../../config/db.config";

export const selectAll = async (userId: number): Promise<ICourse[]> => {
  const query = `SELECT
    c.uuid,
    c.title,
    c.description,
    c.course_image_url,
    CONCAT(u.first_name, ' ', u.last_name) AS teacher
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
    c.description,
    c.course_image_url,
    CONCAT(u.first_name, ' ', u.last_name) AS teacher
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

export const selectByUuid = async (
  courseUuid: string
): Promise<ICourse | null> => {
  try {
    const query = `SELECT
      c.uuid,
      c.title,
      c.description,
      c.course_image_url,
      CONCAT(u.first_name, ' ', u.last_name) AS teacher
    FROM
      courses c
    JOIN
      users u ON c.teacher_id = u.id
    WHERE
      c.uuid = ?`;

    const [rows] = await db.query(query, [courseUuid]);
    const courses = rows as ICourse[];

    return courses.length > 0 ? courses[0] : null;
  } catch (error) {
    throw error;
  }
};

const Courses = {
  selectAll,
  selectByUuid,
};

export default Courses;
