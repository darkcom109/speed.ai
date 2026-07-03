import prisma from "#prisma/client.js"
import { updateProjectSchema } from "#schemas/project-schemas.js"

import { projectRouter } from "../project-router.js"

projectRouter.patch("/:id", async (req, res) => {
  const result = updateProjectSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const project = await prisma.project.findFirst({
    where: {
      id: req.params.id,
      userId: req.userId,
    },
  })

  if (!project) {
    return res.status(404).json({
      error: "Project not found",
    })
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: project.id,
    },
    data: result.data,
    include: {
      tasks: {
        orderBy: [
          { order: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
  })

  return res.status(200).json({
    project: updatedProject,
  })
})
