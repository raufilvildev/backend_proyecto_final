import { ICourse } from "../../interfaces/icourse.interface";
import { Request, Response } from "express";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";
import Courses from "./course.model";

export const getAll = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const courses = await Courses.selectAll(user.id);

    if (courses.length === 0) {
      res.status(200).json({
        message: "No tienes cursos asignados",
        courses: [],
      });
      return;
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: GENERAL_SERVER_ERROR_MESSAGE });
  }
};

export const getByUuid = async (req: Request, res: Response) => {
  const { courseUuid } = req.params;
  try {
    if (!courseUuid) {
      res.status(400).json({ error: "Course UUID is required" });
      return;
    }

    const course = await Courses.selectByUuid(courseUuid);

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: GENERAL_SERVER_ERROR_MESSAGE });
  }
};
