import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js"
import { noteInsightsPrompt } from "#assistant/prompts/note-insights-prompt.js"
import prisma from "#prisma/client.js"

import { noteRouter } from "../note-router.js"

function normalizeInsights(value) {
  const suggestedTasks = Array.isArray(value?.suggestedTasks)
    ? value.suggestedTasks.slice(0, 5).map((task) => ({
        title: String(task?.title || "").trim(),
        description: String(task?.description || "").trim(),
      })).filter((task) => task.title)
    : []

  const relatedNotes = Array.isArray(value?.relatedNotes)
    ? value.relatedNotes.slice(0, 4).map((note) => ({
        id: String(note?.id || "").trim(),
        title: String(note?.title || "").trim(),
        reason: String(note?.reason || "").trim(),
      })).filter((note) => note.id && note.title)
    : []

  const tags = Array.isArray(value?.tags)
    ? value.tags.slice(0, 6).map((tag) => String(tag || "").trim()).filter(Boolean)
    : []

  return {
    summary: String(value?.summary || "No insight summary was generated.").trim(),
    suggestedTasks,
    relatedNotes,
    suggestedFolder: value?.suggestedFolder
      ? String(value.suggestedFolder).trim()
      : "",
    tags,
  }
}

noteRouter.post("/:id/insights", async (req, res) => {
  try {
    const note = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    })

    if (!note) {
      return res.status(404).json({
        error: "Note not found",
      })
    }

    const [relatedNoteCandidates, activeTasks] = await Promise.all([
      prisma.note.findMany({
        where: {
          userId: req.userId,
          NOT: {
            id: note.id,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 12,
        select: {
          id: true,
          title: true,
          folder: true,
          content: true,
          updatedAt: true,
        },
      }),
      prisma.task.findMany({
        where: {
          userId: req.userId,
          completed: false,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 12,
        select: {
          title: true,
          description: true,
          dueDate: true,
        },
      }),
    ])

    const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        stream: false,
        think: false,
        messages: [
          {
            role: "system",
            content: noteInsightsPrompt,
          },
          {
            role: "user",
            content: JSON.stringify({
              currentNote: {
                id: note.id,
                title: note.title,
                folder: note.folder,
                content: note.content,
                updatedAt: note.updatedAt,
              },
              relatedNoteCandidates: relatedNoteCandidates.map((candidate) => ({
                ...candidate,
                content: candidate.content.slice(0, 900),
              })),
              activeTasks,
            }),
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Note insights failed")
    }

    const parsedInsights = JSON.parse(cleanJsonResponse(data.message.content))

    return res.status(200).json({
      insights: normalizeInsights(parsedInsights),
    })
  } catch (error) {
    console.error("Note insights failed:", error)

    return res.status(500).json({
      error: "Note insights failed",
    })
  }
})
