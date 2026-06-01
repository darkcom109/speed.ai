import prisma from "#prisma/client.js";
import { memory } from "#assistant/memory/memory-storage.js";

// Import router
import { assistantRouter } from "./assistant-router.js"

async function deleteAllMessages(userId) {
    await prisma.message.deleteMany({
        where: {
            userId: userId
        }
    })

    memory.messages.splice(0)
    memory.summary = ""

    return true
}

assistantRouter.delete("/messages", async (req, res) => {
    try {
        await deleteAllMessages(req.userId)

        return res.status(200).json({
            message: "Chat cleared",
        })
    }
    catch {
        return res.status(500).json({
            error: "Failed to clear chat"
        })
    }
})

