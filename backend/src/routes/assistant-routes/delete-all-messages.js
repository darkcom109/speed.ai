import prisma from "#prisma/client.js";
import { Router } from "express";
import { requireAuth } from "#middleware/require-auth.js";
import { memory } from "#assistant/memory/memory-storage.js";

const deleteMessagesRouter = Router()
deleteMessagesRouter.use(requireAuth)

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

deleteMessagesRouter.delete("/messages", async (req, res) => {
    try {
        await deleteAllMessages(req.userId)

        return res.status(200).json({
            message: "Chat cleared",
        })
    }
    catch (error) {
        return res.status(500).json({
            error: "Failed to clear chat"
        })
    }
})

export { deleteMessagesRouter }

