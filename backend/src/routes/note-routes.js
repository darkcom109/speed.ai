import { Router } from "express"

import prisma from "../../prisma/client.js"
import { requireAuth } from "../middleware/require-auth.js"
import { createNoteSchema, updateNoteSchema } from "../schemas/note-schemas.js"

const noteRouter = Router()

noteRouter.use(requireAuth)

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

export { noteRouter }
