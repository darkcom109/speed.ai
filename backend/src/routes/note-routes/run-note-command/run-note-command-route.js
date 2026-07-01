import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js"
import { noteCommandPrompt } from "#assistant/prompts/note-command-prompt.js"
import prisma from "#prisma/client.js"

import { noteRouter } from "../note-router.js"

function normalizeEdit(value, fallbackNote) {
  return {
    title: String(value?.title || fallbackNote.title || "Untitled file").trim(),
    folder: String(value?.folder || fallbackNote.folder || "General").trim(),
    content: String(value?.content || fallbackNote.content || "<p></p>").trim(),
    summaryOfChanges: String(
      value?.summaryOfChanges || "Prepared an AI edit for this note."
    ).trim(),
  }
}

noteRouter.post("/:id/command", async (req, res) => {
  try {
    const instruction = String(req.body?.instruction || "").trim()

    if (!instruction) {
      return res.status(400).json({
        error: "Instruction is required",
      })
    }

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

    const currentNote = {
      title: String(req.body?.title || note.title),
      folder: String(req.body?.folder || note.folder),
      content: String(req.body?.content || note.content),
    }

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
            content: noteCommandPrompt,
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction,
              currentNote,
            }),
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Note command failed")
    }

    const parsedEdit = JSON.parse(cleanJsonResponse(data.message.content))

    return res.status(200).json({
      edit: normalizeEdit(parsedEdit, currentNote),
    })
  } catch (error) {
    console.error("Note command failed:", error)

    return res.status(500).json({
      error: "Note command failed",
    })
  }
})
