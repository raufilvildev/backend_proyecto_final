import { ICourse } from "interfaces/icourse.interface";
import { Request, Response } from "express";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";
import { getByUuid } from "features/users/user.controller";
import { selectAll } from "./course.model";

export const getAll = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const courses = await selectAll(user.id);
    // Verificar si el usuario no tiene cursos
    if (courses.length === 0) {
      res.status(200).json({
        message: "No tienes cursos asignados",
        courses: [],
      });
      return;
    }
    res.json(courses);
  } catch (error) {
    res.status(500).json(GENERAL_SERVER_ERROR_MESSAGE);
  }
};
