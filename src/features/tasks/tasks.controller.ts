import { Request, Response } from 'express';
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import Tasks  from "./tasks.model";
import { IUser } from 'interfaces/iuser.interface';

export const getAll = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseuuid }  = req.params;
    const { filter } = req.query;

    if (!courseuuid) {
      // Utilizar método get all (todas las del usuario, no del curso)
      
    }

    const tasks = await Tasks.selectAllTaksByUuid(
      courseuuid,
      //filter
    )

    res.status(200).json(tasks)

  } catch (error) {
     res.status(500).json({
      status: "error",
      message: GENERAL_SERVER_ERROR_MESSAGE,
    });
  }
};

export const selectAllTasks = async (

) => {

}

export const createTask = async (

) => {

}

export const createTaskByTeacher = async (

) => {

}