import prisma from "#prisma/client.js"

// Obtain user finances to provide AI dashboard summariser
export async function getDashboardFinances(userId) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return prisma.expense.findMany({
    where: {
      userId,
      spentAt: {
        gte: startDate,
      },
    },
    select: {
      title: true,
      amount: true,
      kind: true,
      category: true,
      spentAt: true,
    },
    orderBy: {
      spentAt: "desc",
    },
    take: 20,
  })
}