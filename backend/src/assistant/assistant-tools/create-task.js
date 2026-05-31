import prisma from "../../../prisma/client.js"

export async function createTask(userId, args = {}) {
    const { title, description, dueDate } = args

    if (!title) {
        return "I need a task title before I can create that."
    }

    const task = await prisma.task.create({
        data: {
            title,
            description: description || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            userId: userId
        }
    })

    return `Task created: ${task.title}`
}
