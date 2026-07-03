import prisma from "#prisma/client.js"
import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js"
import { buildProjectAiPrompt } from "#assistant/prompts/project-ai-prompt.js"
import { projectAiRequestSchema } from "#schemas/project-schemas.js"

import { projectRouter } from "../project-router.js"

const taskStatusValues = new Set(["backlog", "next", "in_progress", "done"])
const taskAccentPalette = ["#3b82f6", "#a855f7", "#ec4899", "#22c55e", "#f59e0b", "#14b8a6"]

function normalizeAccentColor(value) {
  if (typeof value !== "string") {
    return null
  }

  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : null
}

function getAccentColorFromTaskText(task) {
  const text = `${task.title || ""} ${task.description || ""}`.toLowerCase()

  const buckets = [
    {
      color: "#3b82f6",
      keywords: ["api", "backend", "frontend", "build", "implement", "code", "deploy", "feature", "technical", "setup", "plan"],
    },
    {
      color: "#a855f7",
      keywords: ["design", "ui", "ux", "creative", "research", "wireframe", "prototype", "brand", "visual"],
    },
    {
      color: "#22c55e",
      keywords: ["progress", "progression", "complete", "completion", "review", "health", "improve", "finish", "ship"],
    },
    {
      color: "#f59e0b",
      keywords: ["meeting", "sync", "call", "schedule", "coordinate", "ops", "operation", "admin", "follow-up"],
    },
    {
      color: "#ec4899",
      keywords: ["urgent", "important", "finance", "bill", "payment", "invoice", "budget", "deadline", "priority"],
    },
    {
      color: "#14b8a6",
      keywords: ["note", "document", "docs", "write", "draft", "summary", "content", "knowledge"],
    },
  ]

  for (const bucket of buckets) {
    if (bucket.keywords.some((keyword) => text.includes(keyword))) {
      return bucket.color
    }
  }

  return null
}

function determineAccentColor(task, index, accentPalette) {
  const textColor = getAccentColorFromTaskText(task)

  if (textColor) {
    return textColor
  }

  const normalizedAccentColor = normalizeAccentColor(task.accentColor)

  if (normalizedAccentColor) {
    return normalizedAccentColor
  }

  return accentPalette[index % accentPalette.length]
}

function normalizeDateValue(value) {
  if (value === null) {
    return null
  }

  if (typeof value !== "string" || value.trim() === "") {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

projectRouter.post("/:projectId/ai", async (req, res) => {
  const validationResult = projectAiRequestSchema.safeParse(req.body)

  if (!validationResult.success) {
    return res.status(400).json({
      error: validationResult.error.issues[0].message,
    })
  }

  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId,
      userId: req.userId,
    },
    include: {
      tasks: {
        orderBy: [
          { order: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
  })

  if (!project) {
    return res.status(404).json({
      error: "Project not found",
    })
  }

  const { mode, prompt = "" } = validationResult.data

  const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      stream: false,
      think: true,
      messages: [
        {
          role: "system",
          content: buildProjectAiPrompt(mode),
        },
        {
          role: "system",
          content: `Current date: ${new Date().toISOString()}`,
        },
        {
          role: "user",
          content: JSON.stringify({
            project: {
              id: project.id,
              title: project.title,
              description: project.description,
              status: project.status,
            },
            tasks: project.tasks.map((task) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              dueDate: task.dueDate?.toISOString() || null,
              accentColor: task.accentColor,
            })),
            userPrompt: prompt,
            accentPalette: taskAccentPalette,
          }),
        },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return res.status(500).json({
      error: data.error || "Project AI failed",
    })
  }

  const cleanedResponse = cleanJsonResponse(data.message.content)

  try {
    const parsed = JSON.parse(cleanedResponse)

    if (mode === "help") {
      return res.status(200).json({
        type: "help",
        message: parsed.message || data.message.content,
      })
    }

    if (mode === "brief") {
      const brief = parsed.brief && typeof parsed.brief === "object" ? parsed.brief : {}

      return res.status(200).json({
        type: "brief",
        message: parsed.message || data.message.content,
        brief: {
          summary: typeof brief.summary === "string" ? brief.summary.trim() : "",
          goals: Array.isArray(brief.goals) ? brief.goals.filter((item) => typeof item === "string") : [],
          milestones: Array.isArray(brief.milestones) ? brief.milestones.filter((item) => typeof item === "string") : [],
          firstTasks: Array.isArray(brief.firstTasks) ? brief.firstTasks.filter((item) => typeof item === "string") : [],
        },
      })
    }

    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks
          .map((task, index) => ({
            title: typeof task.title === "string" ? task.title.trim() : "",
            description: typeof task.description === "string" ? task.description.trim() : "",
            status: taskStatusValues.has(task.status) ? task.status : "backlog",
            accentColor: determineAccentColor(task, index, taskAccentPalette),
            dueDate: normalizeDateValue(task.dueDate),
          }))
          .filter((task) => task.title)
      : []

    const moves = Array.isArray(parsed.moves)
      ? parsed.moves
          .map((move) => ({
            taskId: typeof move.taskId === "string" ? move.taskId : "",
            status: taskStatusValues.has(move.status) ? move.status : "",
          }))
          .filter((move) => move.taskId && move.status)
      : []

    return res.status(200).json({
      type: mode,
      message: parsed.message || data.message.content,
      tasks,
      moves,
    })
  } catch {
    return res.status(200).json({
      type: mode,
      message: data.message.content,
      tasks: [],
      moves: [],
    })
  }
})
