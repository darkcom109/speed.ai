export type AppNotification = {
    id: string
    type: string
    title: string
    message: string
    priority: "low" | "medium" | "high"
    taskId: string
    dueDate: string
}