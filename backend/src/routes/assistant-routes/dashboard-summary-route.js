import { Router } from "express"
import { dashboardSummaryPrompt } from "../../assistant/prompts/dashboard-summary-prompt.js"
import { requireAuth } from "../../middleware/require-auth.js"
import { chatSchema } from "../../schemas/chat-schemas.js"
import prisma from "../../../prisma/client.js"

const dashboardSummaryRouter = Router()
dashboardSummaryRouter.use(requireAuth)

async function getDashboardTasks(userId) {
  return prisma.task.findMany({
    where: {
      userId,
    },
    select: {
      title: true,
      description: true,
      completed: true,
      dueDate: true,
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 10,
  })
}

async function getDashboardFinances(userId) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return prisma.expense.findMany({
    where: {
      userId,
      spentAt: {
        gte: startDate,
      },
    },
    select: {
      title: true,
      amount: true,
      kind: true,
      category: true,
      spentAt: true,
    },
    orderBy: {
      spentAt: "desc",
    },
    take: 20,
  })
}

dashboardSummaryRouter.get("/dashboard-summary", async (req, res) => {
    try {
        const tasks = await getDashboardTasks(req.userId)
        const finances = await getDashboardFinances(req.userId)

        const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: {
                Authorization : `Bearer ${process.env.OLLAMA_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL,
                stream: false,
                think: true,
                messages: [
                    {
                        role: "system",
                        content: dashboardSummaryPrompt,
                    },
                    {
                        role: "user",
                        content: JSON.stringify({
                            tasks, 
                            finances,
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

export { dashboardSummaryRouter }
