// Import router
import { assistantRouter } from "../assistant-router.js"

// Import helper functions
import { deleteAllMessages } from "./helper-functions/delete-all-messages-helper.js"

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

