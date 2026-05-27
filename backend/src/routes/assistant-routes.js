import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"

import prisma from "../../prisma/client.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

async function generateOpenRouterMessage(messages) {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key is not configured")
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "openrouter/auto",
            messages,
        }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error?.message || "OpenRouter failed")
    }

    return data.choices?.[0]?.message?.content || "No response generated"
}

async function getTodayTasks(userId) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  return prisma.task.findMany({
    where: {
      userId,
      dueDate: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    select: {
      title: true,
      description: true,
      completed: true,
      dueDate: true,
    },
  })
}

function formatTasksForPrompt(tasks) {
    if (tasks.length === 0) {
        return "No tasks due today."
    }

    return tasks
        .map((task, index) => {
            const status = task.completed ? "completed" : "not completed"
            const description = task.description ? ` - ${task.description}` : ""

            return `${index + 1}. ${task.title}${description} (${status})`
        })
        .join("\n")
}

async function runOpenRouterAssistant(systemPrompt, message, userId) {
    const assistantMessage = await generateOpenRouterMessage([
        {
            role: "system",
            content: systemPrompt,
        },
        {
            role: "user",
            content: message,
        },
    ])

    if (assistantMessage.trim() !== "get_tasks()") {
        return assistantMessage
    }

    const tasks = await getTodayTasks(userId)
    const toolResult = formatTasksForPrompt(tasks)

    return generateOpenRouterMessage([
        {
            role: "system",
            content: systemPrompt,
        },
        {
            role: "user",
            content: message,
        },
        {
            role: "assistant",
            content: "get_tasks()",
        },
        {
            role: "user",
            content: `Tool result from get_tasks():\n${toolResult}\n\nNow answer the user naturally.`,
        },
    ])
}

assistantRouter.post("/chat", async (req, res) => {
    const result = chatSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues[0].message,
        })
    }

    const { message } = result.data

    const systemPrompt = `You are an AI assistant for speed.ai, a productivity tool,
    you are to help the user with any questions and to be polite, keep answers concise
    and practical.

    If the user asks about their tasks, reply with exactly:
    get_tasks()

    Do not explain the function call.
    Do not wrap it in markdown.
    Only use get_tasks() when task data is needed.

    Otherwise, answer normally.
    `

    try {
        const responseMessage = await runOpenRouterAssistant(
            systemPrompt,
            message,
            req.userId
        )

        return res.json({
            message: responseMessage,
            provider: "openrouter",
        })
    }
    catch (error) {
        console.error("OpenRouter assistant error:", error)

        return res.status(500).json({
            error: "Assistant failed to respond"
        })
    }
})

export { assistantRouter }
