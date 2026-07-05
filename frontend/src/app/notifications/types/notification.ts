// This is a comment
export type AppNotification = {
    id: string
    type: string
    title: string
    taskTitle: string
    message: string
    priority: "low" | "medium" | "high"
    taskId: string
    dueDate: string
}
