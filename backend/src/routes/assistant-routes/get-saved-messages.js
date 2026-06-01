import prisma from "#prisma/client.js";
import { Router } from "express";
import { requireAuth } from "#middleware/require-auth.js";

const savedMessagesRouter = Router()
savedMessagesRouter.use(requireAuth)

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

savedMessagesRouter.get("/messages", async (req, res) => {
    try {
        const messages = await getSavedMessages(req.userId)

        return res.status(200).json({
            messages
        })
    }
    catch {
        return res.status(500).json({
            error: "Failed to load saved messages"
        })
    }
})

export { savedMessagesRouter }
