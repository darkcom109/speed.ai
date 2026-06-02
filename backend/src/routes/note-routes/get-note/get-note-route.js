import prisma from "#prisma/client.js"

import { noteRouter } from "../note-router.js"

// Route for retrieving a specific note
noteRouter.get("/:id", async (req, res) => {
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

  return res.status(200).json({
    note,
  })
})
