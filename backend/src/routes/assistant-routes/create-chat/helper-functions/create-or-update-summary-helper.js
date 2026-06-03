import prisma from "#prisma/client.js"

// Create or update the summary stored in the Assistant model helper function
export async function createOrUpdateSummary(userId, compactedContext) {
    const summary = await prisma.assistant.findFirst({
        where: {
            userId: userId
        }
    })
    
    if (summary) {
        await prisma.assistant.update({
            where: {
                userId: userId,
            },
            data: {
                summary: compactedContext
            }
        })
    }
    else {
        await prisma.assistant.create({
            data: {
                userId: userId,
                summary: compactedContext
            }
        })
    }
}