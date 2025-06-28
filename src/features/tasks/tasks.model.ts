import db from "../../config/db.config";
import { ITask } from "interfaces/itask.interface";

interface Task {
  uuid: string;
  category: string;
  title: string;
  description: string;
  due_date: Date;
  time_start: number;
  time_end: number;
  is_urgent: number;
  is_important: number;
  is_completed: number;
  created_at: Date;
  updated_at: Date;
  teacher_id: number;
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

export const selectAllTaksByUuid = async  (
    course_uuid : string,
    //filter: "today" | "week" | "month"
) => {
    let filter_clause = {
        today : "",
        week: "",
        month: ""
    }
    
    const selectAllTasksQuery = 
    `SELECT t.uuid,
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
    t.teacher_id
    FROM tasks t
    LEFT JOIN subtasks st on t.id = st.task_id 
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE courses.uuid = ?
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
    WHERE courses.uuid = ?`


    const [[tasksResult], [subtasksResult]] = await Promise.all([
      db.query(selectAllTasksQuery, [course_uuid]),
      db.query(selectAllSubTasksQuery, [course_uuid]),
    ]);

    const taskMap = new Map<string, Task>();

    for (const task of tasksResult as Task[]) {
        taskMap.set(task.uuid, {
            uuid: task.uuid,
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
            teacher_id: task.teacher_id,
            subtasks: []
        })
    }

    for (const subtask of subtasksResult as SubTask[]) {
        const task = taskMap.get(subtask.uuid);
        if (task) {
            task.subtasks.push(subtask);
        }
    }

    return Array.from(taskMap.values());
}

export const selectAllTasksFromACourse = async (
    courseId: string,
    userId: number
) => {
    const [result] = await db.query(
        'SELECT * FROM tasks'
    )
}

export const selectAllTasks = async (

) => {

}

export const createTask = async (

) => {

}

export const createTaskByTeacher = async (

) => {

}

export default {
    selectAllTaksByUuid,
    selectAllTasksFromACourse,
    selectAllTasks,
    createTask,
    createTaskByTeacher
};
    

