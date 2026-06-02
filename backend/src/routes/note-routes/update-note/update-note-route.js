import prisma from "#prisma/client.js"
import { updateNoteSchema } from "#schemas/note-schemas.js"

import { noteRouter } from "../note-router.js"

// Route for editing a note
noteRouter.patch("/:id", async (req, res) => {
  const result = updateNoteSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
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

  const updatedNote = await prisma.note.update({
    where: {
      id: note.id,
    },
    data: result.data,
  })

  return res.status(200).json({
    note: updatedNote,
  })
})
