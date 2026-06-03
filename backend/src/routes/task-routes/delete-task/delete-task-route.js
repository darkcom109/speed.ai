import prisma from "#prisma/client.js"

import { taskRouter } from "../task-router.js"

// Delete a specific task owned by the signed-in user
taskRouter.delete("/:id", async (req, res) => {
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

  await prisma.task.delete({
    where: {
      id: task.id,
    },
  })

  return res.status(200).json({
    message: "Task deleted",
  })
})
