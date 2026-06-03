import prisma from "#prisma/client.js"

import { taskRouter } from "../task-router.js"

taskRouter.delete("/delete_all", async (req, res) => {
  try {
    const result = await prisma.task.deleteMany({
      where: {
        userId: req.userId,
        completed: false,
      },
    })

    return res.status(200).json({
      message: "All tasks deleted",
      count: result.count,
    })
  } catch {
    return res.status(500).json({
      error: "Failed to delete all tasks",
    })
  }
})
