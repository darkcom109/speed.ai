import prisma from "#prisma/client.js"

// Obtain user tasks to provide AI dashboard summariser
export async function getDashboardTasks(userId) {
  return prisma.task.findMany({
    where: {
      userId,
    },
    select: {
      title: true,
      description: true,
      completed: true,
      dueDate: true,
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 10,
  })
}