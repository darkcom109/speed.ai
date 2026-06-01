import prisma from "#prisma/client.js"
import { memory } from "#assistant/memory/memory-storage.js"

export async function deleteAllMessages(userId) {
    await prisma.message.deleteMany({
        where: {
            userId: userId
        }
    })

    memory.messages.splice(0)
    memory.summary = ""

    return true
}