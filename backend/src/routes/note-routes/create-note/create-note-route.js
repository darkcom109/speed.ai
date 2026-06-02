import prisma from "#prisma/client.js"
import { createNoteSchema } from "#schemas/note-schemas.js"

import { noteRouter } from "../note-router.js"

// Route for creating a note
noteRouter.post("/", async (req, res) => {
  const result = createNoteSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const { title, content, folder } = result.data

  const note = await prisma.note.create({
    data: {
      title,
      content: content || "",
      folder: folder || "General",
      userId: req.userId,
    },
  })

  return res.status(201).json({
    note,
  })
})
