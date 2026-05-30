import prisma from "../../../prisma/client.js"

// Assistant tool to get most recent tasks
export async function getTasks(userId) {
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId
        },
        take: 5
    })

    const parsedTasks = tasks.length
        ? tasks.map((task, index) => `${index + 1}. ${task.title}`).join("\n")
        : "You do not have any tasks yet."

    return parsedTasks
}