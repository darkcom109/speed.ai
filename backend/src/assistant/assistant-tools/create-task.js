import prisma from "#prisma/client.js"

// Assistant tool to create tasks
export async function createTask(userId, args = {}) {
    const taskInputs = Array.isArray(args) ? args : [args]
    const createdTasks = []

    if (taskInputs.length === 0) {
        return "I need a task title before I can create that."
    }

    for (const taskInput of taskInputs) {
        const { title, description, dueDate } = taskInput

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

        createdTasks.push(task)
    }

    if (createdTasks.length === 1) {
        return `Task created: ${createdTasks[0].title}`
    }

    return `Tasks created:\n${createdTasks
        .map((task, index) => `${index + 1}. ${task.title}`)
        .join("\n")}`
}
