import prisma from "#prisma/client.js";
import { updateTaskSystemPrompt } from "#assistant/prompts/update-task-prompt.js";
import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js";

export async function updateTask(userId, args) {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: userId,
                completed: false
            },
            select: {
                id: true,
                title: true,
                description: true,
                completed: true,
                dueDate: true
            }
        })
        
        const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: {
                Authorization : `Bearer ${process.env.OLLAMA_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL,
                stream: false,
                think: true,
                messages: [
                    {
                        role: "system",
                        content: updateTaskSystemPrompt
                    },
                    {
                        role: "user",
                        content: `Requested updates: ${JSON.stringify(args)}`
                    },
                    {
                        role: "user",
                        content: `Current tasks: ${JSON.stringify(tasks)}`
                    }
                ]
            })
        })

        const data = await response.json()

        if (!response.ok) {
            return data.error
        }

        const cleanedResponse = cleanJsonResponse(data.message.content)
        const updatedTasks = JSON.parse(cleanedResponse)

        if (!Array.isArray(updatedTasks)) {
            return "Error updating task"
        }

        const appliedTasks = []

        for (const task of updatedTasks) {
            if (!task.id) {
                continue
            }

            const updateData = {}

            if (Object.hasOwn(task, "title")) {
                updateData.title = task.title
            }

            if (Object.hasOwn(task, "description")) {
                updateData.description = task.description
            }

            if (Object.hasOwn(task, "completed")) {
                updateData.completed = task.completed
            }

            if (Object.hasOwn(task, "dueDate")) {
                updateData.dueDate = task.dueDate ? new Date(task.dueDate) : null
            }

            if (Object.keys(updateData).length === 0) {
                continue
            }

            const updateResult = await prisma.task.updateMany({
                where: {
                    id: task.id,
                    userId: userId,
                },
                data: updateData
            })

            if (updateResult.count > 0) {
                const originalTask = tasks.find((currentTask) => currentTask.id === task.id)

                appliedTasks.push({
                    ...originalTask,
                    ...task,
                })
            }
        }

        if (appliedTasks.length === 0) {
            return "No matching tasks found to update."
        }

        return `Tasks updated:\n${appliedTasks
            .map((task, index) => `${index + 1}. ${task.title}`)
            .join("\n")}`
    }
    catch {
        return "Error updating task"
    }
}
