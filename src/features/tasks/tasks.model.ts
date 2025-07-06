import db from "../../config/db.config";
import {
  ITaskInsertData,
  ISubtasksInsertData,
} from "../../interfaces/itask.interface";
import { randomUUID } from "crypto";
import { IUser } from "../../interfaces/iuser.interface";

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
  uuid: string;
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

export const selectAllTasks = async (userId: number) => {
  const selectAllTasksQuery = `SELECT t.id,
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
    t.updated_at,
    t.uuid
    FROM tasks t
    LEFT JOIN subtasks st on t.id = st.task_id 
    WHERE t.user_id = ?
    ORDER BY due_date ASC`;

  const selectAllSubTasksQuery = `
    SELECT st.uuid,
    st.task_id,
    st.title,
    st.is_completed,
    st.created_at,
    st.updated_at
    FROM subtasks st
    LEFT JOIN tasks t on t.id = st.task_id
    WHERE t.user_id = ?`;

  const [[tasksResult], [subtasksResult]] = await Promise.all([
    db.query(selectAllTasksQuery, [userId]),
    db.query(selectAllSubTasksQuery, [userId]),
  ]);

  const taskMap = new Map<number, Task>();

  for (const task of tasksResult as Task[]) {
    taskMap.set(task.id, {
      id: task.id,
      user_id: task.user_id,
      course_id: task.course_id,
      category: task.category,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      time_start: task.time_start,
      time_end: task.time_end,
      is_urgent: task.is_urgent,
      is_important: task.is_important,
      is_completed: task.is_completed,
      created_at: task.created_at,
      updated_at: task.updated_at,
      uuid: task.uuid,
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

export const selectAllTasksFiltered = async (
  userId: number,
  filter: "today" | "week" | "month"
) => {
  let filter_clause = {
    today: "AND due_date <= CURDATE()",
    week: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 7 DAY) OR due_date IS NULL)",
    month:
      "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 30 DAY) OR due_date IS NULL)",
  };

  const filter_sql = filter_clause[filter];

  const selectAllTasksQuery = `SELECT t.id,
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
    t.updated_at,
    t.uuid
    FROM tasks t
    LEFT JOIN subtasks st on t.id = st.task_id 
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
    LEFT JOIN tasks t on t.id = st.task_id
    WHERE t.user_id = ?`;

  const [[tasksResult], [subtasksResult]] = await Promise.all([
    db.query(selectAllTasksQuery, [userId]),
    db.query(selectAllSubTasksQuery, [userId]),
  ]);

  const taskMap = new Map<number, Task>();

  for (const task of tasksResult as Task[]) {
    taskMap.set(task.id, {
      id: task.id,
      user_id: task.user_id,
      course_id: task.course_id,
      category: task.category,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      time_start: task.time_start,
      time_end: task.time_end,
      is_urgent: task.is_urgent,
      is_important: task.is_important,
      is_completed: task.is_completed,
      created_at: task.created_at,
      updated_at: task.updated_at,
      uuid: task.uuid,
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
  filter?: "today" | "week" | "month"
) => {
  let filter_sql = "";
  
  if (filter) {
    const filter_clause = {
      today: "AND due_date <= CURDATE()",
      week: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 7 DAY) OR due_date IS NULL)",
      month: "AND ((due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 30 DAY) OR due_date IS NULL)",
    };
    filter_sql = filter_clause[filter];
  }

  const selectAllTasksQuery = `SELECT t.id,
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
    t.updated_at,
    t.uuid
    FROM tasks t
    LEFT JOIN subtasks st on t.id = st.task_id 
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
    LEFT JOIN tasks t on t.id = st.task_id
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE c.uuid = ?`;

  const [[tasksResult], [subtasksResult]] = await Promise.all([
    db.query(selectAllTasksQuery, [course_uuid]),
    db.query(selectAllSubTasksQuery, [course_uuid]),
  ]);

  const taskMap = new Map<number, Task>();

  for (const task of tasksResult as Task[]) {
    taskMap.set(task.id, {
      id: task.id,
      user_id: task.user_id,
      course_id: task.course_id,
      category: task.category,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      time_start: task.time_start,
      time_end: task.time_end,
      is_urgent: task.is_urgent,
      is_important: task.is_important,
      is_completed: task.is_completed,
      created_at: task.created_at,
      updated_at: task.updated_at,
      uuid: task.uuid,
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
  const taskQuery = `
    INSERT INTO tasks (uuid, user_id, course_id, title, description, due_date, time_start, time_end, category, is_urgent, is_important, is_completed, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,0,NOW(),NOW())`;

  const subTaskQuery = `
    INSERT INTO subtasks (uuid, task_id, title, is_completed, created_at, updated_at)
    VALUES (?,?,?,0,NOW(),NOW())`;

  const is_important = taskData.is_important === true ? 1 : 0;
  const is_urgent = taskData.is_urgent === true ? 1 : 0;

  const [taskResult]: any = await db.query(taskQuery, [
    taskData.uuid,
    userId,
    null,
    taskData.title,
    taskData.description,
    taskData.due_date,
    taskData.time_start,
    taskData.time_end,
    taskData.category,
    is_important,
    is_urgent,
  ]);

  const taskId = taskResult.insertId;

  if (Array.isArray(subTasksData) && subTasksData.length > 0) {
    for (const subtask of subTasksData) {
      await db.query(subTaskQuery, [subtask.uuid, taskId, subtask.title]);
    }
  }

  const taskMap = new Map<number, Task>();

  const [createdTaskRows]: any = await db.query(
    `SELECT * FROM tasks WHERE id = ?`,
    [taskId]
  );

  const [createdSubtasks]: any = await db.query(
    `SELECT * FROM subtasks WHERE task_id = ?`,
    [taskId]
  );

  for (const task of createdTaskRows as Task[]) {
    taskMap.set(task.id, {
      uuid: task.uuid,
      id: task.id,
      user_id: task.user_id,
      course_id: task.course_id,
      category: task.category,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      time_start: task.time_start,
      time_end: task.time_end,
      is_urgent: task.is_urgent,
      is_important: task.is_important,
      is_completed: task.is_completed,
      created_at: task.created_at,
      updated_at: task.updated_at,
      subtasks: [],
    });
  }

  for (const subtask of createdSubtasks as SubTask[]) {
    const task = taskMap.get(subtask.task_id);
    if (task) {
      task.subtasks.push(subtask);
    }
  }

  return Array.from(taskMap.values());
};

export const createTaskByTeacher = async (
  course_uuid: string,
  user: IUser,
  taskData: ITaskInsertData,
  subTasksData: ISubtasksInsertData[]
) => {
  const is_important = taskData.is_important === true ? 1 : 0;
  const is_urgent = taskData.is_urgent === true ? 1 : 0;

  /*   const [courseResult]: any = await db.query(
    `SELECT id FROM courses WHERE courses.uuid = ?`,
    course_uuid
  );
  const courseId = courseResult[0].id; */

  const [enrollmentsResult]: any = await db.query(
    `SELECT student_id, course_id FROM enrollments
  LEFT JOIN courses ON courses.id = enrollments.course_id WHERE courses.uuid = ?`,
    course_uuid
  );

  console.log(enrollmentsResult);

  const courseId = enrollmentsResult[0].course_id;

  console.log(courseId);

  const userId = user.id;

  const taskQuery = `
    INSERT INTO tasks (uuid, user_id, course_id, title, description, due_date, time_start, time_end, category, is_urgent, is_important, is_completed, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,0,NOW(),NOW())`;

  const subTaskQuery = `
    INSERT INTO subtasks (uuid, task_id, title, is_completed, created_at, updated_at)
    VALUES (?,?,?,0,NOW(),NOW())`;

  let tasksResult = [];

  for (const student of enrollmentsResult) {
    const studentId = student.student_id;
    const task_uuid = randomUUID();
    const [newTask]: any = await db.query(taskQuery, [
      task_uuid,
      studentId,
      courseId,
      taskData.title,
      taskData.description,
      taskData.due_date,
      taskData.time_start,
      taskData.time_end,
      taskData.category,
      is_important,
      is_urgent,
    ]);

    const newTaskId = newTask.insertId;

    if (Array.isArray(subTasksData) && subTasksData.length > 0) {
      for (const subtask of subTasksData) {
        const subtaskUuid = randomUUID();
        await db.query(subTaskQuery, [subtaskUuid, newTaskId, subtask.title]);
      }
    }

    const [createdTaskRows]: any = await db.query(
      `SELECT * FROM tasks WHERE id = ?`,
      [newTaskId]
    );
    const [createdSubtasks]: any = await db.query(
      `SELECT * FROM subtasks WHERE task_id = ?`,
      [newTaskId]
    );

    const createdTask = createdTaskRows[0];
    tasksResult.push({
      id: createdTask.id,
      uuid: createdTask.uuid,
      user_id: createdTask.user_id,
      course_id: createdTask.course_id,
      category: createdTask.category,
      title: createdTask.title,
      description: createdTask.description,
      due_date: createdTask.due_date,
      time_start: createdTask.time_start,
      time_end: createdTask.time_end,
      is_urgent: createdTask.is_urgent,
      is_important: createdTask.is_important,
      priority_color: "neutral", // Ajusta según tu lógica
      is_completed: createdTask.is_completed,
      created_at: createdTask.created_at,
      updated_at: createdTask.updated_at,
      subtasks: createdSubtasks,
    });
  }
  return tasksResult;
};

export const updateTask = async (
  task_uuid: string,
  updatedData: ITaskInsertData,
  subtasks: ISubtasksInsertData
) => {
  const updateQuery = `
    UPDATE tasks
    SET title = ?, description = ?, due_date = ?, time_start = ?, time_end = ?, category = ?, is_urgent = ?, is_important = ?, is_completed = ?, updated_at = NOW()
    WHERE uuid = ?`;

  const updateSubtasksQuery = `
    UPDATE subtasks
    SET title = ?, is_completed = ?
    WHERE uuid = ?`;

  const is_important = updatedData.is_important === true ? 1 : 0;
  const is_urgent = updatedData.is_urgent === true ? 1 : 0;
  const is_completed = updatedData.is_completed === true ? 1 : 0;

  await db.query(updateQuery, [
    updatedData.title,
    updatedData.description,
    updatedData.due_date,
    updatedData.time_start,
    updatedData.time_end,
    updatedData.category,
    is_urgent,
    is_important,
    is_completed,
    task_uuid,
  ]);

  const [taskRows]: any = await db.query(`SELECT * FROM tasks WHERE uuid = ?`, [
    task_uuid,
  ]);
  const task = taskRows[0];
  if (!task) throw new Error("Task not found");

  const [existingSubtasks]: any = await db.query(
    `SELECT subtasks.uuid FROM subtasks LEFT JOIN tasks on subtasks.task_id = tasks.id WHERE tasks.uuid = ?`,
    [task_uuid]
  );

  const existingUuids = existingSubtasks.map((st: any) => st.uuid);
  const receivedUuids = Array.isArray(subtasks)
    ? subtasks.map((st: any) => st.uuid)
    : [];

  for (const uuid of existingUuids) {
    if (!receivedUuids.includes(uuid)) {
      await db.query(`DELETE FROM subtasks WHERE uuid = ?`, [uuid]);
    }
  }

  if (Array.isArray(subtasks) && subtasks.length > 0) {
    for (const subtask of subtasks) {
      let subtask_completed = subtask.is_completed === true ? 1 : 0;
      if (existingUuids.includes(subtask.uuid)) {
        // Update si existe
        await db.query(updateSubtasksQuery, [
          subtask.title,
          subtask_completed,
          subtask.uuid,
        ]);
      } else {
        // Insert si no existe
        const insertSubtaskQuery = `
          INSERT INTO subtasks (uuid, task_id, title, is_completed, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        await db.query(insertSubtaskQuery, [
          randomUUID(),
          task.id,
          subtask.title,
          subtask_completed,
        ]);
      }
    }
  }

  const [updatedSubtasks]: any = await db.query(
    `SELECT * FROM subtasks WHERE task_id = ?`,
    [task.id]
  );

  return {
    ...task,
    subtasks: updatedSubtasks,
  };
};

export const patchUrgencyImportance = async (
  task_uuid: string,
  is_urgent: boolean,
  is_important: boolean
) => {
  const query = `
    UPDATE tasks
    SET is_urgent = ?, is_important = ?, updated_at = NOW()
    WHERE uuid = ?`;

  await db.query(query, [is_urgent ? 1 : 0, is_important ? 1 : 0, task_uuid]);

  const [taskRows]: any = await db.query(`SELECT * FROM tasks WHERE uuid = ?`, [
    task_uuid,
  ]);
  const task = taskRows[0];

  const [subtasks]: any = await db.query(
    `SELECT * FROM subtasks WHERE task_id = ?`,
    [task.id]
  );

  return {
    ...task,
    subtasks,
  };
};

export const deleteTask = async (task_uuid: string) => {
  const [taskRows]: any = await db.query(`SELECT * FROM tasks WHERE uuid = ?`, [
    task_uuid,
  ]);
  const task = taskRows[0];
  if (!task) return null;

  await db.query(`DELETE FROM subtasks WHERE task_id = ?`, [task.id]);
  await db.query(`DELETE FROM tasks WHERE id = ?`, [task.id]);

  // Retorna directamente la tarea eliminada
  return task;
};

export default {
  selectAllTasks,
  selectAllTasksFiltered,
  selectAllTasksByCourseUuid,
  createTask,
  createTaskByTeacher,
  updateTask,
  patchUrgencyImportance,
  deleteTask,
};
