import prisma from "#prisma/client.js"

// Obtain user tasks to provide AI dashboard summariser
export async function getDashboardTasks(userId) {
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 2)
  endDate.setHours(23, 59, 59, 999)

  return prisma.task.findMany({
    where: {
      userId,
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      title: true,
      description: true,
      completed: true,
      dueDate: true
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 10,
  })
}