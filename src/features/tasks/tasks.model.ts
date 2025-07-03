import db from "../../config/db.config";
import { ITaskInsertData, ISubtasksInsertData } from "interfaces/itask.interface";
import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: number;
  user_id: number;
  course_id?: number;
  category: "custom" | "course_related";
  title: string;
  description?: string;
  due_date?: Date;
  time_start?: number;
  time_end?: number;
  is_urgent: boolean;
  is_important: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  subtasks: SubTask[];
}

interface SubTask {
  id: number;
  uuid: string;
  task_id: number;
  title: string;
  is_completed: number;
  created_at: Date;
  updated_at: Date;
}

export const selectAllTasks = async (
  userId: number,
  filter: "today" | "week" | "month"
) => {
  const filter_clause = {
    today: "AND due_date <= CURDATE()",
    week: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 7 DAY) OR due_date IS NULL)",
    month: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 30 DAY) OR due_date IS NULL)"
  };

  const filter_sql = filter_clause[filter];

  const selectAllTasksQuery = `
    SELECT t.id,
           t.user_id,
           t.course_id,
           t.category,
           t.title,
           t.description,
           t.due_date,
           t.time_start,
           t.time_end,
           t.is_urgent,
           t.is_important,
           t.is_completed,
           t.created_at,
           t.updated_at
    FROM tasks t
    WHERE t.user_id = ? ${filter_sql}
    ORDER BY due_date ASC`;

  const selectAllSubTasksQuery = `
    SELECT st.uuid,
           st.task_id,
           st.title,
           st.is_completed,
           st.created_at,
           st.updated_at
    FROM subtasks st
    LEFT JOIN tasks t ON t.id = st.task_id
    WHERE t.user_id = ?`;

  const [[tasksResult], [subtasksResult]] = await Promise.all([
    db.query(selectAllTasksQuery, [userId]),
    db.query(selectAllSubTasksQuery, [userId]),
  ]);

  const taskMap = new Map<number, Task>();

  for (const task of tasksResult as Task[]) {
    taskMap.set(task.id, {
      ...task,
      subtasks: [],
    });
  }

  for (const subtask of subtasksResult as SubTask[]) {
    const task = taskMap.get(subtask.task_id);
    if (task) {
      task.subtasks.push(subtask);
    }
  }

  return Array.from(taskMap.values());
};

export const selectAllTasksByCourseUuid = async (
  course_uuid: string,
  filter: "today" | "week" | "month"
) => {
  const filter_clause = {
    today: "AND due_date <= CURDATE()",
    week: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 7 DAY) OR due_date IS NULL)",
    month: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 30 DAY) OR due_date IS NULL)"
  };

  const filter_sql = filter_clause[filter];

  const selectAllTasksQuery = `
    SELECT t.id,
           t.user_id,
           t.course_id,
           t.category,
           t.title,
           t.description,
           t.due_date,
           t.time_start,
           t.time_end,
           t.is_urgent,
           t.is_important,
           t.is_completed,
           t.created_at,
           t.updated_at
    FROM tasks t
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE c.uuid = ? ${filter_sql}
    ORDER BY due_date ASC`;

  const selectAllSubTasksQuery = `
    SELECT st.uuid,
           st.task_id,
           st.title,
           st.is_completed,
           st.created_at,
           st.updated_at
    FROM subtasks st
    LEFT JOIN tasks t ON t.id = st.task_id
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE c.uuid = ?`;

  const [[tasksResult], [subtasksResult]] = await Promise.all([
    db.query(selectAllTasksQuery, [course_uuid]),
    db.query(selectAllSubTasksQuery, [course_uuid]),
  ]);

  const taskMap = new Map<number, Task>();

  for (const task of tasksResult as Task[]) {
    taskMap.set(task.id, {
      ...task,
      subtasks: [],
    });
  }

  for (const subtask of subtasksResult as SubTask[]) {
    const task = taskMap.get(subtask.task_id);
    if (task) {
      task.subtasks.push(subtask);
    }
  }

  return Array.from(taskMap.values());
};

export const createTask = async (
  userId: number,
  taskData: ITaskInsertData,
  subTasksData: ISubtasksInsertData[]
) => {
  const uuid = taskData.uuid || uuidv4();
  const is_important = taskData.is_important ? 1 : 0;
  const is_urgent = taskData.is_urgent ? 1 : 0;

  const taskQuery = `
    INSERT INTO tasks (uuid, user_id, course_id, title, description, due_date, time_start, time_end, category, is_urgent, is_important, is_completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`;

  const [taskResult]: any = await db.query(taskQuery, [
    uuid,
    userId,
    null,
    taskData.title,
    taskData.description,
    taskData.due_date,
    taskData.time_start,
    taskData.time_end,
    taskData.category,
    is_urgent,
    is_important,
  ]);

  const taskId = taskResult.insertId;

  const subTaskQuery = `
    INSERT INTO subtasks (uuid, task_id, title, is_completed, created_at, updated_at)
    VALUES (?, ?, ?, 0, NOW(), NOW())`;

  for (const subtask of subTasksData) {
    const subtaskUuid = subtask.uuid || uuidv4();
    await db.query(subTaskQuery, [subtaskUuid, taskId, subtask.title]);
  }

  const [createdTaskRows]: any = await db.query(`SELECT * FROM tasks WHERE id = ?`, [taskId]);
  const [createdSubtasks]: any = await db.query(`SELECT * FROM subtasks WHERE task_id = ?`, [taskId]);

  return [{
    ...createdTaskRows[0],
    subtasks: createdSubtasks,
  }];
};

export const createTaskByTeacher = async (
  course_uuid: string,
  userId: number,
  taskData: ITaskInsertData,
  subTasksData: ISubtasksInsertData[]
) => {
  const uuid = taskData.uuid || uuidv4();
  const is_important = taskData.is_important ? 1 : 0;
  const is_urgent = taskData.is_urgent ? 1 : 0;

  const [courseRows]: any = await db.query(`SELECT id FROM courses WHERE uuid = ?`, [course_uuid]);
  const courseId = courseRows[0]?.id;

  if (!courseId) {
    throw new Error("Curso no encontrado con ese UUID.");
  }

  const taskQuery = `
    INSERT INTO tasks (uuid, user_id, course_id, title, description, due_date, time_start, time_end, category, is_urgent, is_important, is_completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`;

  const [taskResult]: any = await db.query(taskQuery, [
    uuid,
    userId,
    courseId,
    taskData.title,
    taskData.description,
    taskData.due_date,
    taskData.time_start,
    taskData.time_end,
    taskData.category,
    is_urgent,
    is_important,
  ]);

  const taskId = taskResult.insertId;

  const subTaskQuery = `
    INSERT INTO subtasks (uuid, task_id, title, is_completed, created_at, updated_at)
    VALUES (?, ?, ?, 0, NOW(), NOW())`;

  for (const subtask of subTasksData) {
    const subtaskUuid = subtask.uuid || uuidv4();
    await db.query(subTaskQuery, [subtaskUuid, taskId, subtask.title]);
  }

  const [studentsResult]: any = await db.query(`
    SELECT student_id FROM enrollments WHERE course_id = ?`, [courseId]);

  return {
    ...{
      id: taskId,
      user_id: userId,
      course_id: courseId,
      category: taskData.category,
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.due_date,
      time_start: taskData.time_start,
      time_end: taskData.time_end,
      is_urgent,
      is_important,
      is_completed: false,
      created_at: new Date(),
      updated_at: new Date(),
      subtasks: subTasksData.map(st => ({
        id: st.task_id,
        uuid: st.uuid || uuidv4(),
        task_id: taskId,
        title: st.title,
        is_completed: 0,
        created_at: new Date(),
        updated_at: new Date()
      }))
    },
    course: courseId,
    students: studentsResult
  };
};

export const selectTasksGroupedByCourses = async (
  userId: number,
  filter: "today" | "week" | "month"
) => {
  const filter_clause = {
    today: "AND due_date <= CURDATE()",
    week: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 7 DAY) OR due_date IS NULL)",
    month: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 30 DAY) OR due_date IS NULL)"
  };

  const query = `
  SELECT c.uuid as course_uuid, c.title as course_name, t.*
  FROM tasks t
  LEFT JOIN courses c ON t.course_id = c.id
  WHERE t.user_id = ? ${filter_clause[filter]}
  ORDER BY c.title ASC, t.due_date ASC;
  `;

  const [result] = await db.query(query, [userId]);
  return result;
};

export const updateTaskByUuid = async (
  uuid: string,
  data: Partial<ITaskInsertData>
) => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(", ");
  const values = Object.values(data);

  const query = `UPDATE tasks SET ${fields}, updated_at = NOW() WHERE uuid = ?`;
  await db.query(query, [...values, uuid]);

  const [updated] = await db.query(`SELECT * FROM tasks WHERE uuid = ?`, [uuid]);
  return updated;
};

export const patchPriority = async (
  uuid: string,
  is_urgent: boolean,
  is_important: boolean
) => {
  const query = `
    UPDATE tasks
    SET is_urgent = ?, is_important = ?, updated_at = NOW()
    WHERE uuid = ?`;

  await db.query(query, [is_urgent ? 1 : 0, is_important ? 1 : 0, uuid]);
  const [updated] = await db.query(`SELECT * FROM tasks WHERE uuid = ?`, [uuid]);
  return updated;
};

export const deleteTask = async (uuid: string) => {
  await db.query(`DELETE FROM tasks WHERE uuid = ?`, [uuid]);
};

export default {
  selectAllTasksByCourseUuid,
  selectAllTasks,
  createTask,
  createTaskByTeacher,
  selectTasksGroupedByCourses,
  updateTaskByUuid,
  patchPriority,
  deleteTask
};
