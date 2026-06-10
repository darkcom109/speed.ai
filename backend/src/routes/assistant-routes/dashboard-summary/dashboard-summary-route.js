// Dashboard summary prompt
import { dashboardSummaryPrompt } from "#assistant/prompts/dashboard-summary-prompt.js"

// Import router
import { assistantRouter } from "../assistant-router.js"

// Helper functions
import { getDashboardTasks, getDashboardFinances } from "./helper-functions/index.js"
import { getSavings } from "#assistant/assistant-tools/get-savings.js"

// Generate dashboard summary route
assistantRouter.get("/dashboard-summary", async (req, res) => {
    try {
        const tasks = await getDashboardTasks(req.userId)
        const finances = await getDashboardFinances(req.userId)
        const savings = await getSavings(req.userId)

        const currentTime = `Current date: ${new Date()}`

        const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: {
                Authorization : `Bearer ${process.env.OLLAMA_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL,
                stream: false,
                think: false,
                messages: [
                    {
                        role: "system",
                        content: dashboardSummaryPrompt,
                    },
                    {
                        role: "system",
                        content: currentTime,
                    },
                    {
                        role: "user",
                        content: JSON.stringify({
                            tasks, 
                            finances,
                            savings,
                        })
                    }
                ]
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "AI assistant failed")
        }

        return res.status(200).json({
            message: data.message.content,
        })
    }
    catch(error) {
        console.error("Dashboard summary failed:", error)

        return res.status(500).json({
            error: "Dashboard summary failed",
        })
    }

})
