import prisma from "#prisma/client.js"

// Assistant tool to get most recent tasks
export async function getTasks(userId) {
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId,
            completed: false
        },
        take: 20
    })

    const parsedTasks = tasks.length
        ? tasks.map((task, index) => `${index + 1}. ${task.title}`).join("\n")
        : "This user does not have any tasks yet."

    return parsedTasks
}