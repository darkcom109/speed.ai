import prisma from "#prisma/client.js"

import { projectRouter } from "../project-router.js"

projectRouter.get("/", async (req, res) => {
  const projects = await prisma.project.findMany({
    where: {
      userId: req.userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
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
    projects,
  })
})
