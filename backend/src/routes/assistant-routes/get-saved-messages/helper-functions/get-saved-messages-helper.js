import prisma from "#prisma/client.js"

// Get saved messages helper function
export async function getSavedMessages(userId) {
    const messages = await prisma.message.findMany({
        where: {
            userId: userId
        },
        select: {
            id: true,
            role: true,
            content: true,
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    return messages
}