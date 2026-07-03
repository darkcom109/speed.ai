import prisma from "#prisma/client.js"

import { projectRouter } from "../project-router.js"

projectRouter.delete("/:projectId/tasks/:taskId", async (req, res) => {
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

  const task = await prisma.projectTask.findFirst({
    where: {
      id: req.params.taskId,
      projectId: project.id,
    },
  })

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    })
  }

  await prisma.projectTask.delete({
    where: {
      id: task.id,
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

  return res.status(200).json({
    message: "Project task deleted",
  })
})
