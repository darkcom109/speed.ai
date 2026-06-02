import prisma from "#prisma/client.js"

// Create message helper function
export async function createMessage(message, userId) {
    await prisma.message.create({
        data: {
            role: message.role,
            content: message.content,
            userId: userId,
        }
    })
}