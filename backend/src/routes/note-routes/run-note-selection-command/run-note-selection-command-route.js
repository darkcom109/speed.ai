import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js"
import { noteSelectionCommandPrompt } from "#assistant/prompts/note-selection-command-prompt.js"
import prisma from "#prisma/client.js"

import { noteRouter } from "../note-router.js"

const MAX_SELECTION_CHARS = 6000

function normalizeSelectionEdit(value, fallbackText) {
  return {
    replacementHtml: String(
      value?.replacementHtml || `<p>${fallbackText}</p>`
    ).trim(),
    summaryOfChanges: String(
      value?.summaryOfChanges || "Prepared an AI edit for the selected text."
    ).trim(),
  }
}

noteRouter.post("/:id/selection-command", async (req, res) => {
  try {
    const instruction = String(req.body?.instruction || "").trim()
    const selectedText = String(req.body?.selectedText || "").trim()
    const noteContext = String(req.body?.noteContext || "").slice(0, 4000)

    if (!instruction) {
      return res.status(400).json({
        error: "Instruction is required",
      })
    }

    if (!selectedText) {
      return res.status(400).json({
        error: "Selected text is required",
      })
    }

    if (selectedText.length > MAX_SELECTION_CHARS) {
      return res.status(400).json({
        error: "Selected text is too long for an AI selection edit",
      })
    }

    const note = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      select: {
        id: true,
        title: true,
        folder: true,
      },
    })

    if (!note) {
      return res.status(404).json({
        error: "Note not found",
      })
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
            content: noteSelectionCommandPrompt,
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction,
              selectedText,
              noteContext,
              note: {
                title: note.title,
                folder: note.folder,
              },
            }),
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Selection command failed")
    }

    const parsedEdit = JSON.parse(cleanJsonResponse(data.message.content))

    return res.status(200).json({
      edit: normalizeSelectionEdit(parsedEdit, selectedText),
    })
  } catch (error) {
    console.error("Selection command failed:", error)

    return res.status(500).json({
      error: "Selection command failed",
    })
  }
})
