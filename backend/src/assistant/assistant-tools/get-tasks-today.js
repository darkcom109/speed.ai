import prisma from "#prisma/client.js"

// Assistant tool get to today's tasks
export async function getTasksToday(userId) {
    const startOfToday = new Date()
    const endOfToday = new Date()

    startOfToday.setHours(0, 0, 0, 0)
    endOfToday.setHours(23, 59, 59, 999)

    const tasks = await prisma.task.findMany({
        where: {
            userId: userId,
            dueDate: {
                gte: startOfToday,
                lte: endOfToday
            }
        },
        take: 10
    })

    const parsedTasks = tasks.length
        ? tasks.map((task, index) => `${index + 1}. ${task.title}`).join("\n")
        : "You do not have any tasks yet."

    return parsedTasks
}