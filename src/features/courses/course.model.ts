import { ICourse } from "../../interfaces/icourse.interface";
import db from "../../config/db.config";
import { IUser } from "interfaces/iuser.interface";

export interface CourseInsertData {
  uuid: string;
  teacher_id: number;
  title: string;
  description?: string;
  course_image_url?: string;
  planning?: string;
}

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
    console.error(`User role ${user.role} no tiene acceso`);
  }

  try {
    const [rows] = await db.query(query, params);
    const courses = rows as ICourse[];

    return courses.length > 0 ? courses[0] : null;
  } catch (error) {
    throw error;
  }
};

export const insert = async (
  courseData: CourseInsertData,
  studentUuids: string[]
): Promise<ICourse> => {
  try {
    const queryInsertCourse = `
      INSERT INTO courses (uuid, teacher_id, title, description, planning, course_image_url) 
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const [courseResult]: any = await db.query(queryInsertCourse, [
      courseData.uuid,
      courseData.teacher_id,
      courseData.title,
      courseData.description,
      courseData.planning,
      courseData.course_image_url,
    ]);

    const newCourseId = courseResult.insertId;

    if (studentUuids && studentUuids.length > 0) {
      const queryGetStudentIds = `SELECT id FROM users WHERE uuid IN (?);`;
      const [studentRows]: any = await db.query(queryGetStudentIds, [
        studentUuids,
      ]);

      if (studentRows.length !== studentUuids.length) {
        throw new Error("Uno o más UUIDs de estudiantes no son válidos.");
      }

      const enrollmentValues = studentRows.map((student: { id: number }) => [
        student.id,
        newCourseId,
      ]);

      const enrollmentsSql = `
        INSERT INTO enrollments (student_id, course_id) VALUES ?;
      `;
      await db.query(enrollmentsSql, [enrollmentValues]);
    }

    const [newCourseRows]: any = await db.query(
      "SELECT * FROM courses WHERE id = ?",
      [newCourseId]
    );

    return newCourseRows[0] as ICourse;
  } catch (error) {
    console.error("error en el modelo de creación de curso ");
    throw error;
  }
};

const Courses = {
  selectAll,
  selectByUuid,
  insert,
};

export default Courses;
