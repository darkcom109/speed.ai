import prisma from "#prisma/client.js"

import { projectRouter } from "../project-router.js"

projectRouter.delete("/:id", async (req, res) => {
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

  await prisma.project.delete({
    where: {
      id: project.id,
    },
  })

  return res.status(200).json({
    message: "Project deleted",
  })
})
