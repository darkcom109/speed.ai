import prisma from "#prisma/client.js"

import { taskRouter } from "../task-router.js"

// Get all tasks for the signed-in user
taskRouter.get("/", async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return res.status(200).json({
    tasks,
  })
})
