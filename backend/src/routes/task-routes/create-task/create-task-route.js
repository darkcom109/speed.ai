import prisma from "#prisma/client.js"
import { createTaskSchema } from "#schemas/task-schemas.js"

import { taskRouter } from "../task-router.js"

taskRouter.post("/", async (req, res) => {
  const result = createTaskSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const { title, description, dueDate } = result.data

  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate,
      userId: req.userId,
    },
  })

  return res.status(201).json({
    task,
  })
})
