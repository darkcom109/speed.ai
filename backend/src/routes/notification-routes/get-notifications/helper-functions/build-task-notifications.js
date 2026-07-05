import { formatDateTime } from "./format-date-time.js"
import { buildDateTime } from "./build-date-time.js"

// Helper function to build notifications queue
export function buildTaskNotifications(tasks, timeZone) {
    const { now, todayStart, tomorrowStart, dayAfterTomorrowStart, nextHour } = buildDateTime(timeZone)

    const notifications = []

    for (const task of tasks) {
        if (!task.dueDate || task.completed) {
            continue
        }

        const dueDate = new Date(task.dueDate)

        // CASE 1 - Overdue
        if (dueDate < now) {
            notifications.push({
                id: `task-overdue-${task.id}`,
                type: "overdue_task",
                title: "Overdue Task",
                message: `"${task.title}" was due ${formatDateTime(dueDate, timeZone)}.`,
                priority: "high",
                taskId: task.id,
                dueDate: task.dueDate,
            })
            continue
        }
        
        // CASE 2 - Due Soon
        if (dueDate <= nextHour) {
            notifications.push({
                id: `task-due-soon-${task.id}`,
                type: "task_due_soon",
                title: "Task Due Soon",
                message: `"${task.title}" is due at ${formatDateTime(dueDate, timeZone)}.`,
                priority: "high",
                taskId: task.id,
                dueDate: task.dueDate,
            })
            continue
        }

        // CASE 3 - Due Today
        if (dueDate >= todayStart && dueDate < tomorrowStart) {
            notifications.push({
                id: `task-due-today-${task.id}`,
                type: "task_due_today",
                title: "Task Due Today",
                message: `"${task.title}" is due today at ${formatDateTime(dueDate, timeZone)}.`,
                priority: "medium",
                taskId: task.id,
                dueDate: task.dueDate,
            })
            continue
        }

        // CASE 4 - Due Tomorrow
        if (dueDate >= tomorrowStart && dueDate < dayAfterTomorrowStart) {
            notifications.push({
                id: `task-due-tomorrow-${task.id}`,
                type: "task_due_tomorrow",
                title: "Task Due Tomorrow",
                message: `"${task.title}" is due tomorrow at ${formatDateTime(dueDate, timeZone)}.`,
                priority: "low",
                taskId: task.id,
                dueDate: task.dueDate,
            })
        }
    }

    return notifications
}
