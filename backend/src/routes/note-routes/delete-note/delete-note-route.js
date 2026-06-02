import prisma from "#prisma/client.js"

import { noteRouter } from "../note-router.js"

// Route for deleting a specific note
noteRouter.delete("/:id", async (req, res) => {
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

  await prisma.note.delete({
    where: {
      id: note.id,
    },
  })

  return res.status(200).json({
    message: "Note deleted",
  })
})
