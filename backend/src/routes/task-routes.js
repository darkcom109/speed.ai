import { Router } from "express"

import prisma from "../../prisma/client.js"
import { requireAuth } from "../middleware/require-auth.js"
import { createTaskSchema, updateTaskSchema } from "../schemas/task-schemas.js"

const taskRouter = Router()

taskRouter.use(requireAuth)

taskRouter.post("/", async (req, res) => {
    const result = createTaskSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues[0].message,
        })
    }

    const { title, description, dueDate } = result.data

    const task = await prisma.task.create({
        data: {
            title,
            description,
            dueDate,
            userId: req.userId
        }
    })

    return res.status(201).json({
        task,
    })
})

taskRouter.get("/", async (req, res) => {
    const tasks = await prisma.task.findMany({
        where: {
            userId: req.userId
        },
        orderBy: {
            createdAt: "desc",
        }
    })

    return res.status(200).json({
        tasks,
    })
})

taskRouter.patch("/:id", async (req, res) => {
    const result = updateTaskSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues[0].message,
        })
    }

    const task = await prisma.task.findFirst({
        where: {
            id: req.params.id,
            userId: req.userId
        },
    })

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        })
    }

    const updatedTask = await prisma.task.update({
        where: {
            id: task.id,
        },
        data: result.data
    })

    return res.status(200).json({
        task: updatedTask
    })
})

taskRouter.delete("/:id", async (req, res) => {
    const task = await prisma.task.findFirst({
        where: {
            id: req.params.id,
            userId: req.userId,
        },
    })

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        })
    }

    await prisma.task.delete({
        where: {
            id: task.id,
        }
    })

    return res.status(200).json({
        message: "Task deleted"
    })
})

export { taskRouter }