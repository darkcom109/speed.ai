import prisma from "#prisma/client.js"

// Get saved summary helper function
export async function getSavedSummary(userId) {
    const summary = await prisma.assistant.findFirst({
        where: {
            userId: userId,
        },
        select: {
            summary: true,
        },
    })

    return summary
}