import prisma from "#prisma/client.js"
import { updateProjectTaskSchema } from "#schemas/project-schemas.js"

import { projectRouter } from "../project-router.js"

projectRouter.patch("/:projectId/tasks/:taskId", async (req, res) => {
  const result = updateProjectTaskSchema.safeParse(req.body)

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

  const nextStatus = result.data.status || task.status
  const nextOrder =
    result.data.status && result.data.status !== task.status
      ? await prisma.projectTask.count({
          where: {
            projectId: project.id,
            status: nextStatus,
            NOT: {
              id: task.id,
            },
          },
        })
      : task.order

  const updatedTask = await prisma.projectTask.update({
    where: {
      id: task.id,
    },
    data: {
      ...result.data,
      status: nextStatus,
      order: nextOrder,
      dueDate:
        result.data.dueDate === undefined
          ? undefined
          : result.data.dueDate === null
            ? null
            : result.data.dueDate,
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
    task: updatedTask,
  })
})
