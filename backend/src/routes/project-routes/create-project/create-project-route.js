import prisma from "#prisma/client.js"
import { createProjectSchema } from "#schemas/project-schemas.js"

import { projectRouter } from "../project-router.js"

projectRouter.post("/", async (req, res) => {
  const result = createProjectSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const { title, description, status } = result.data

  const project = await prisma.project.create({
    data: {
      title,
      description,
      status: status || "active",
      userId: req.userId,
    },
    include: {
      tasks: true,
    },
  })

  return res.status(201).json({
    project,
  })
})
