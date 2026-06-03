import prisma from "#prisma/client.js"
import { updateTaskSchema } from "#schemas/task-schemas.js"

import { taskRouter } from "../task-router.js"

// Update a specific task owned by the signed-in user
taskRouter.patch("/:id", async (req, res) => {
  const result = updateTaskSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const task = await prisma.task.findFirst({
    where: {
      id: req.params.id,
      userId: req.userId,
    },
  })

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    })
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: task.id,
    },
    data: result.data,
  })

  return res.status(200).json({
    task: updatedTask,
  })
})
