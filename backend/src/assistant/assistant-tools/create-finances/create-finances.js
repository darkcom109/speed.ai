import prisma from "#prisma/client.js"
import { allowedCategories } from "#assistant/assistant-tools/create-finances/allowed-categories.js"

// Assistant tool to create either expenses or incomes.
export async function createFinances(userId, args = {}) {
    const financeInputs = Array.isArray(args) ? args : [args]
    const createdFinances = []

    if (financeInputs.length === 0) {
        return "I need a finance entry before I can create it."
    }

    for (const financeInput of financeInputs) {
        const {
            title,
            amount,
            kind = "expense",
            category,
            spentAt,
        } = financeInput

        if (!title) {
            return "I need a title before I can create that finance entry."
        }

        if (!amount || Number(amount) <= 0) {
            return `I need a positive amount for "${title}".`
        }

        if (!["expense", "income"].includes(kind)) {
            return `"${kind}" is not a valid finance entry type. Use "expense" or "income".`
        }

        const defaultCategory = kind === "income" ? "Income" : "General"
        const selectedCategory = category || defaultCategory

        if (!allowedCategories[kind].includes(selectedCategory)) {
            return `"${selectedCategory}" is not a valid ${kind} category. Use one of: ${allowedCategories[kind].join(", ")}.`
        }

        const finance = await prisma.expense.create({
            data: {
                title,
                amount: Math.abs(Number(amount)),
                kind,
                category: selectedCategory,
                spentAt: spentAt ? new Date(spentAt) : undefined,
                userId,
            },
        })

        createdFinances.push(finance)
    }

    if (createdFinances.length === 1) {
        return `Finance entry created: ${createdFinances[0].title}`
    }

    return `Finance entries created:\n${createdFinances
        .map((finance, index) => `${index + 1}. ${finance.title}`)
        .join("\n")}`
}
