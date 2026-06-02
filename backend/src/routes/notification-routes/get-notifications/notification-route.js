import prisma from "#prisma/client.js"
import { buildTaskNotifications } from "./helper-functions/build-task-notifications.js"
import { notificationRouter } from "../notification-router.js"

// Route for creating notifications
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
    } catch {
        return res.status(500).json({
            error: "Failed to load notifications",
        })
    }
})
