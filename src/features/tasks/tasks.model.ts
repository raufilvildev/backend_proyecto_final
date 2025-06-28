import db from "../../config/db.config";
import { ITask } from "interfaces/itask.interface";

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

export const selectAllTasksByCourseUuid = async  (
    course_uuid : string,
    filter: "today" | "week" | "month"
) => {
    let filter_clause = {
        today : "",
        week: "AND (due_date >= NOW() - INTERVAL 7 DAY) OR due_date = NULL",
        month: "AND (due_date >= NOW() - INTERVAL 30 DAY) OR due_date = NULL"
    }

    const filter_sql = filter_clause[filter]
    
    const selectAllTasksQuery = 
    `SELECT t.id,
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
    LEFT JOIN subtasks st on t.id = st.task_id 
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE c.uuid = ? ${filter_sql}
    ORDER BY due_date ASC`

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
    WHERE c.uuid = ?`


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
            subtasks: []
        })
    }

    for (const subtask of subtasksResult as SubTask[]) {
        const task = taskMap.get(subtask.task_id);
        if (task) {
            task.subtasks.push(subtask);
        }
    }

    return Array.from(taskMap.values());
}

export const selectAllTasks = async (
    userId : number,
    filter: "today" | "week" | "month"
) => {
    let filter_clause = {
        today : "",
        week: "AND (due_date >= NOW() - INTERVAL 7 DAY) OR due_date = NULL",
        month: "AND (due_date >= NOW() - INTERVAL 30 DAY) OR due_date = NULL"
    }

    const filter_sql = filter_clause[filter]

    const selectAllTasksQuery = 
    `SELECT t.id,
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
    LEFT JOIN subtasks st on t.id = st.task_id 
    WHERE t.user_id = ? ${filter_sql}
    ORDER BY due_date ASC`

    const selectAllSubTasksQuery = `
    SELECT st.uuid,
    st.task_id,
    st.title,
    st.is_completed,
    st.created_at,
    st.updated_at
    FROM subtasks st
    LEFT JOIN tasks t on t.id = st.task_id
    WHERE t.user_id = ?`

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
            subtasks: []
        })
    }

    for (const subtask of subtasksResult as SubTask[]) {
        const task = taskMap.get(subtask.task_id);
        if (task) {
            task.subtasks.push(subtask);
        }
    }

    return Array.from(taskMap.values());
}

export const createTask = async (

) => {

}

export const createTaskByTeacher = async (

) => {

}

export default {
    selectAllTasksByCourseUuid,
    selectAllTasks,
    createTask,
    createTaskByTeacher
};
    

