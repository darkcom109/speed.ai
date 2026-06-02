import prisma from "#prisma/client.js"

import { noteRouter } from "../note-router.js"

// Route for retrieving all notes
noteRouter.get("/", async (req, res) => {
  const notes = await prisma.note.findMany({
    where: {
      userId: req.userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return res.status(200).json({
    notes,
  })
})
