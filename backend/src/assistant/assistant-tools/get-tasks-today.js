import prisma from "../../../prisma/client.js"

// Assistant tool get to today's tasks
export async function getTasksToday(userId) {
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId,
            dueDate: {
                gte: new Date().setHours(0, 0, 0, 0),
                lte: new Date().setHours(23, 59, 59, 999)
            }
        }
    })

    const parsedTasks = tasks.length
        ? tasks.map((task, index) => `${index + 1}. ${task.title}`).join("\n")
        : "You do not have any tasks yet."

    return parsedTasks
}