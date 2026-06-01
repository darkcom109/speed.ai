// Import router
import { assistantRouter } from "../assistant-router.js"

// Helper functions
import { getSavedMessages } from "./helper-functions/get-saved-messages-helper.js"

// Return saved messages stored on the user's account
assistantRouter.get("/messages", async (req, res) => {
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
