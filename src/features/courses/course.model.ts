import { ICourse } from "../../interfaces/icourse.interface";
import db from "../../config/db.config";
import { IUser } from "interfaces/iuser.interface";

export const selectAll = async (userId: number): Promise<ICourse[]> => {
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
  } catch (error) {
    throw error;
  }
};

export const selectByUuid = async (
  courseUuid: string,
  user: IUser
): Promise<ICourse | null> => {
  let query: string = "";
  const params: (string | number)[] = [courseUuid];
  if (user.role === "teacher") {
    query = `SELECT 
      c.uuid,
      c.title,
      c.description,
      c.course_image_url,
      CONCAT(u.first_name, " ", u.last_name) AS teacher
      FROM 
      courses c
      JOIN users u ON c.teacher_id = u.id
      WHERE
      c.uuid = ? AND c.teacher_id = ?`;
    params.push(user.id);
  } else if (user.role === "student") {
    query = `
      SELECT
        c.uuid,
        c.title,
        c.description,
        c.course_image_url,
        CONCAT(u.first_name, ' ', u.last_name) AS teacher
      FROM
        courses c
      JOIN
        users u ON c.teacher_id = u.id
      JOIN
        enrollments e ON c.id = e.course_id
      WHERE
        c.uuid = ? AND e.student_id = ?`;
    params.push(user.id);
  } else {
    console.error(`User role ${user.role} not allowed`);
  }

  try {
    const [rows] = await db.query(query, params);
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
