import prisma from "#prisma/client.js"

// Get saved summary helper function
export async function getSavedSummary(userId) {
    const data = await prisma.assistant.findFirst({
        where: {
            userId: userId,
        },
        select: {
            summary: true,
        },
    })

    if (!data) {
        return "No summary is available yet"
    }

    const summary = data.summary

    return summary
}