import prisma from "#prisma/client.js"
import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js"
import { allowedCategories } from "#assistant/assistant-tools/create-finances/allowed-categories.js"
import { updateFinancesSystemPrompt } from "#assistant/prompts/update-finances-prompt.js"

function getUpdateData(financeUpdate, existingFinance) {
    const updateData = {}
    const nextKind = Object.hasOwn(financeUpdate, "kind")
        ? financeUpdate.kind
        : existingFinance.kind

    if (Object.hasOwn(financeUpdate, "title")) {
        updateData.title = financeUpdate.title
    }

    if (Object.hasOwn(financeUpdate, "amount")) {
        const amount = Number(financeUpdate.amount)

        if (!Number.isFinite(amount) || amount <= 0) {
            return null
        }

        updateData.amount = Math.abs(amount)
    }

    if (Object.hasOwn(financeUpdate, "kind")) {
        if (!["expense", "income"].includes(financeUpdate.kind)) {
            return null
        }

        updateData.kind = financeUpdate.kind
    }

    if (Object.hasOwn(financeUpdate, "category")) {
        if (!allowedCategories[nextKind]?.includes(financeUpdate.category)) {
            return null
        }

        updateData.category = financeUpdate.category
    }

    if (Object.hasOwn(financeUpdate, "spentAt")) {
        const spentAt = new Date(financeUpdate.spentAt)

        if (Number.isNaN(spentAt.getTime())) {
            return null
        }

        updateData.spentAt = spentAt
    }

    return updateData
}

// Assistant tool to update existing finance entries.
export async function updateFinances(userId, args) {
    try {
        const finances = await prisma.expense.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                title: true,
                amount: true,
                kind: true,
                category: true,
                spentAt: true,
            },
            orderBy: {
                spentAt: "desc",
            },
            take: 50,
        })

        const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL,
                stream: false,
                think: true,
                messages: [
                    {
                        role: "system",
                        content: updateFinancesSystemPrompt,
                    },
                    {
                        role: "user",
                        content: `Requested updates: ${JSON.stringify(args)}`,
                    },
                    {
                        role: "user",
                        content: `Current finance entries: ${JSON.stringify(finances)}`,
                    },
                ],
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            return data.error
        }

        const cleanedResponse = cleanJsonResponse(data.message.content)
        const updatedFinances = JSON.parse(cleanedResponse)

        if (!Array.isArray(updatedFinances)) {
            return "Error updating finances"
        }

        const appliedFinances = []

        for (const financeUpdate of updatedFinances) {
            if (!financeUpdate.id) {
                continue
            }

            const existingFinance = finances.find(
                (finance) => finance.id === financeUpdate.id
            )

            if (!existingFinance) {
                continue
            }

            const updateData = getUpdateData(financeUpdate, existingFinance)

            if (!updateData || Object.keys(updateData).length === 0) {
                continue
            }

            const updateResult = await prisma.expense.updateMany({
                where: {
                    id: financeUpdate.id,
                    userId,
                },
                data: updateData,
            })

            if (updateResult.count > 0) {
                appliedFinances.push({
                    ...existingFinance,
                    ...financeUpdate,
                })
            }
        }

        if (appliedFinances.length === 0) {
            return "No matching finance entries found to update."
        }

        return `Finance entries updated:\n${appliedFinances
            .map((finance, index) => `${index + 1}. ${finance.title}`)
            .join("\n")}`
    }
    catch {
        return "Error updating finances"
    }
}
