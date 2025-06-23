import { ICourse } from "../../interfaces/icourse.interface";
import db from "../../config/db.config";
import { IUser } from "interfaces/iuser.interface";
import { decrypt } from "../../shared/utils/crypto.util";

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
  const baseQuery = `
    SELECT 
      c.uuid,
      c.title,
      c.description,
      c.planning,
      c.course_image_url,
      CONCAT(u_teacher.first_name, " ", u_teacher.last_name) AS teacher,
      IF(COUNT(e.id) > 0, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'uuid', u_student.uuid,
            'first_name', u_student.first_name,
            'last_name', u_student.last_name,
            'email', u_student.email,
            'username', u_student.username
          )
        ),
        JSON_ARRAY()
      ) AS students
    FROM 
      courses c
    JOIN 
      users u_teacher ON c.teacher_id = u_teacher.id
    LEFT JOIN 
      enrollments e ON c.id = e.course_id
    LEFT JOIN 
      users u_student ON e.student_id = u_student.id
  `;

  let query: string = "";
  const params: (string | number)[] = [courseUuid];

  if (user.role === "teacher") {
    query = `
      ${baseQuery}
      WHERE
        c.uuid = ? AND c.teacher_id = ?
      GROUP BY c.id;
    `;
    params.push(user.id);
  } else if (user.role === "student") {
    query = `
      ${baseQuery}
      JOIN
        enrollments e_access ON c.id = e_access.course_id
      WHERE
        c.uuid = ? AND e_access.student_id = ?
      GROUP BY c.id;
    `;
    params.push(user.id);
  } else {
    console.error(`User role ${user.role} no tiene acceso`);
    return null;
  }

  try {
    const [rows] = await db.query(query, params);
    const courses = rows as any[];

    if (courses.length === 0) {
      return null;
    }

    const course = courses[0];

    if (course.students && typeof course.students === "string") {
      course.students = JSON.parse(course.students);
    }

    if (Array.isArray(course.students)) {
      course.students = course.students.map((student: any) => {
        if (!student.email) {
          return student;
        }
        return {
          ...student,
          email: decrypt(student.email),
        };
      });
    }

    if (course.planning && typeof course.planning === "string") {
      try {
        course.planning = JSON.parse(course.planning);
      } catch (error) {
        console.error("El planning no es un JSON válido:", course.planning);
      }
    }

    return course as ICourse;
  } catch (error) {
    console.error("Error en selectByUuid model:", error);
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
