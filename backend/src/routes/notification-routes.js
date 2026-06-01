import { Router } from "express"

import prisma from "../../prisma/client.js"
import { requireAuth } from "../middleware/require-auth.js"

const notificationRouter = Router()
notificationRouter.use(requireAuth)

function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

function buildTaskNotifications(tasks) {
    const now = new Date()

    // Get today's date
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // Get tomorrow's date
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    // Get the day after tomorrow's date
    const dayAfterTomorrowStart = new Date(todayStart)
    dayAfterTomorrowStart.setDate(dayAfterTomorrowStart.getDate() + 2)

    // Get today's date + 1 hour ahead
    const nextHour = new Date(now)
    nextHour.setHours(nextHour.getHours() + 1)

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
                message: `"${task.title}" was due ${formatDateTime(dueDate)}.`,
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
                message: `"${task.title}" is due at ${formatDateTime(dueDate)}.`,
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
                message: `"${task.title}" is due today at ${formatDateTime(dueDate)}.`,
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
                message: `"${task.title}" is due tomorrow at ${formatDateTime(dueDate)}.`,
                priority: "low",
                taskId: task.id,
                dueDate: task.dueDate,
            })
        }
    }

    return notifications
}

notificationRouter.get("/", async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: req.userId,
                completed: false,
                dueDate: {
                    not: null,
                },
            },
            select: {
                id: true,
                title: true,
                dueDate: true,
                completed: true,
            },
            orderBy: {
                dueDate: "asc",
            },
        })

        const notifications = buildTaskNotifications(tasks)

        return res.status(200).json({
            notifications,
        })
    } catch (error) {
        console.error("Failed to load notifications:", error)

        return res.status(500).json({
            error: "Failed to load notifications",
        })
    }
})

export { notificationRouter }
