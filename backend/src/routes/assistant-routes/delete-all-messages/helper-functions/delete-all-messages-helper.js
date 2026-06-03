import prisma from "#prisma/client.js"

// Clear all messages and summary
export async function deleteAllMessages(userId) {
    await prisma.message.deleteMany({
        where: {
            userId: userId
        }
    })

    const summaryExists = await prisma.assistant.findFirst({
        where: {
            userId: userId
        }
    })

    if (summaryExists) {
        await prisma.assistant.delete({
            where: {
                userId: userId
            }
        })
    }
}