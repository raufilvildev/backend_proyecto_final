import { Request, Response } from "express";
import fs from "node:fs";
import { GENERAL_SERVER_ERROR_MESSAGE } from "../../shared/utils/constants.util";
import { IUser } from "../../interfaces/iuser.interface";
import Courses from "./course.model";
import {
  ICourseInsertData,
  ICourseUpdateData,
} from "../../interfaces/icourse.interface";
import { generateCoursePdf } from "../../shared/utils/pdfshare.util";

export const getAll = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const courses = await Courses.selectAll(user.id);

    if (courses.length === 0) {
      res.status(200).json([]);
      return;
    }

    res.json(courses);
  } catch (error) {
    console.log("error en getAll controller cursos", error);
    res.status(500).json({ error: GENERAL_SERVER_ERROR_MESSAGE });
  }
};

export const getByUuid = async (req: Request, res: Response) => {
  try {
    const { courseUuid } = req.params;
    const user = req.user as IUser;
    if (!courseUuid) {
      res.status(400).json({ error: "Course UUID es requerido" });
      return;
    }

    const course = await Courses.selectByUuid(courseUuid, user);

    if (!course) {
      res.status(404).json({ error: "No se encuentra el curso" });
      return;
    }

    res.json(course);
  } catch (error) {
    console.log("error en getByUuid controller cursos", error);
    res.status(500).json({ error: GENERAL_SERVER_ERROR_MESSAGE });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { title, description, students, planning, uuid } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title es requerido." });
      return;
    }

    let imageUrl: string | undefined = undefined;
    if (req.file) {
      const uploadDir = "public/uploads/courses/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const extension = req.file.mimetype.split("/")[1] || "";
      const newName = `${req.file.filename}.${extension}`;
      const newPath = `${uploadDir}${newName}`;
      fs.renameSync(req.file.path, newPath);
      imageUrl = newName;
    }

    let studentUuids: string[] = [];
    if (students) {
      try {
        const parsedStudents = JSON.parse(students);
        if (!Array.isArray(parsedStudents)) {
          res.status(400).json({ error: "Estudiantes debe ser un array" });
          return;
        }
        studentUuids = parsedStudents
          .map((student: any) => {
            if (student && typeof student.uuid === "string") {
              return student.uuid;
            }
            return null;
          })
          .filter((uuid) => uuid !== null) as string[];

        if (
          parsedStudents.length > 0 &&
          studentUuids.length !== parsedStudents.length
        ) {
          res.status(400).json({
            error: "Uno o mas estudiantes no tienen un UUID válido",
          });
          return;
        }
      } catch (error) {
        res.status(400).json({ error: "Formato de students inválido" });
      }
    }

    let planningDataJson: string | undefined = undefined;
    if (planning) {
      try {
        const parsedPlanning = JSON.parse(planning);
        planningDataJson = JSON.stringify(parsedPlanning);
      } catch (error) {
        res.status(400).json({ error: "Formato inválido para planning" });
      }
    }

    const courseDataToInsert: ICourseInsertData = {
      uuid,
      teacher_id: user.id,
      title,
      description: description,
      course_image_url: imageUrl,
      planning: planningDataJson,
    };

    const newCourse = await Courses.insert(courseDataToInsert, studentUuids);

    res.status(201).json(newCourse);
  } catch (error) {
    console.log("error creando curso", error);
    res.status(500).json({ error: GENERAL_SERVER_ERROR_MESSAGE });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { uuid, title, description, students, planning } = req.body;

    if (!uuid) {
      res.status(400).json({
        error: "El UUID del curso es requerido para la actualización.",
      });
      return;
    }

    const courseDataToUpdate: ICourseUpdateData = {};

    if (title !== undefined) courseDataToUpdate.title = title;
    if (description !== undefined) courseDataToUpdate.description = description;

    if (req.file) {
      const uploadDir = "public/uploads/courses/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const extension = req.file.mimetype.split("/")[1] || "";
      const newName = `${req.file.filename}.${extension}`;
      const newPath = `${uploadDir}${newName}`;
      fs.renameSync(req.file.path, newPath);
      courseDataToUpdate.course_image_url = newName;
    }

    let studentUuids: string[] | undefined = undefined;
    if (students) {
      try {
        const parsedStudents = JSON.parse(students);
        if (!Array.isArray(parsedStudents)) {
          res.status(400).json({ error: "Estudiantes debe ser un array" });
          return;
        }
        studentUuids = parsedStudents.map((student: any) => student.uuid);
      } catch (error) {
        res.status(400).json({ error: "Formato de students inválido" });
        return;
      }
    }

    let planningDataJson: string | undefined = undefined;
    if (planning) {
      try {
        const parsedPlanning = JSON.parse(planning);
        planningDataJson = JSON.stringify(parsedPlanning);
        courseDataToUpdate.planning = planningDataJson;
      } catch (error) {
        res.status(400).json({ error: "Formato inválido para planning" });
        return;
      }
    }

    const updatedCourse = await Courses.update(
      uuid,
      user.id,
      courseDataToUpdate,
      studentUuids
    );

    if (!updatedCourse) {
      res.status(404).json({
        error: "Curso no encontrado o no tienes permiso para editarlo.",
      });
      return;
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.log("Error actualizando curso", error);
    res.status(500).json({ error: GENERAL_SERVER_ERROR_MESSAGE });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { courseUuid } = req.params;
    const user = req.user as IUser;
    if (!courseUuid) {
      res.status(400).json({
        error: "El UUID del curso es requerido para el borrado",
      });
    }

    const isRemoved = await Courses.remove(courseUuid, user.id);

    if (isRemoved) {
      res.status(200).json({ message: "Curso eliminado correctamente" });
    } else {
      res.status(404).json({
        error: "Curso no encontrado o no tienes permiso para eliminarlo",
      });
    }
  } catch (error) {
    console.log("Error borrando curso (controller)", error);
    res.status(500).json({ error: GENERAL_SERVER_ERROR_MESSAGE });
  }
};

export const exportAsPdf = async (req: Request, res: Response) => {
  try {
    const { courseUuid } = req.params;
    const user = req.user as IUser;

    if (!courseUuid) {
      res.status(400).json({ error: "Course UUID es requerido" });
      return;
    }

    const course = await Courses.selectByUuid(courseUuid, user);
    if (!course) {
      res
        .status(404)
        .json({ error: "No se encuentra el curso o no tienes acceso." });
      return;
    }

    const pdfBuffer = await generateCoursePdf(course);

    const safeTitle = course.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=informe_${safeTitle}.pdf`
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.log("Error exportando curso a PDF (controller)", error);
    res.status(500).json({ error: "Error al generar el informe en PDF." });
  }
};
