import prisma from "#prisma/client.js"

// Assistant tool to get expenses from the last 30 days.
export async function getExpenses(userId) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const expenses = await prisma.expense.findMany({
        where: {
            userId: userId,
            spentAt: {
                gte: startDate,
            },
            kind: "expense",
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

    const parsedExpenses = expenses.length
        ? expenses
            .map((expense, index) => {
                const spentAt = expense.spentAt.toLocaleDateString("en-GB")

                return `${index + 1}. ${expense.title} - spent £${expense.amount} on ${spentAt}`
            })
            .join("\n")
        : "This user does not have any expenses yet."

    return parsedExpenses
}