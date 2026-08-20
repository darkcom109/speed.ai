import prisma from "#prisma/client.js"
import { createProjectTaskSchema } from "#schemas/project-schemas.js"

import { projectRouter } from "../project-router.js"

projectRouter.post("/:projectId/tasks", async (req, res) => {
  const result = createProjectTaskSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId,
      userId: req.userId,
    },
  })

  if (!project) {
    return res.status(404).json({
      error: "Project not found",
    })
  }

  const nextOrder = await prisma.projectTask.count({
    where: {
      projectId: project.id,
      status: result.data.status || "backlog",
    },
  })

  const task = await prisma.projectTask.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      status: result.data.status || "backlog",
      accentColor: result.data.accentColor,
      dueDate: result.data.dueDate,
      order: nextOrder,
      projectId: project.id,
    },
  })

  await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      updatedAt: new Date(),
    },
  })

  return res.status(201).json({
    task,
  })
})
