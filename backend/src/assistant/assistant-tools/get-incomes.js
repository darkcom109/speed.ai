import prisma from "#prisma/client.js"

// Assistant tool to get incomes from the last 30 days.
export async function getIncomes(userId) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const incomes = await prisma.expense.findMany({
        where: {
            userId: userId,
            spentAt: {
                gte: startDate,
            },
            kind: "income",
        },
        select: {
            amount: true,
            title: true,
            spentAt: true,
        },
        orderBy: {
            spentAt: "desc",
        },
    })

    const parsedIncomes = incomes.length
        ? incomes
            .map((income, index) => {
                const spentAt = income.spentAt.toLocaleDateString("en-GB")

                return `${index + 1}. ${income.title} - earned £${income.amount} on ${spentAt}`
            })
            .join("\n")
        : "This user does not have any incomes yet."

    return parsedIncomes
}