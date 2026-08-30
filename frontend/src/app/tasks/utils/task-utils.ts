import type { Task, TaskFilter } from "@/app/tasks/types"

function emitTasksUpdated() {
  window.dispatchEvent(new Event("tasks-updated"))
}

function getPageCount(totalTasks: number, tasksPerPage: number) {
  return Math.max(1, Math.ceil(totalTasks / tasksPerPage))
}

function getPaginatedTasks(tasks: Task[], page: number, tasksPerPage: number) {
  const start = (page - 1) * tasksPerPage

  return tasks.slice(start, start + tasksPerPage)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function matchesTaskFilter(task: Task, taskFilter: TaskFilter) {
  if (taskFilter === "all") {
    return true
  }

  if (taskFilter === "completed") {
    return task.completed
  }

  if (taskFilter === "no-date") {
    return !task.dueDate
  }

  if (!task.dueDate) {
    return false
  }

  const today = startOfDay(new Date())
  const dueDate = startOfDay(new Date(task.dueDate))
  const nextSevenDays = new Date(today)
  nextSevenDays.setDate(today.getDate() + 7)

  if (taskFilter === "due-today") {
    return isSameDay(dueDate, today)
  }

  if (taskFilter === "overdue") {
    return dueDate < today
  }

  if (taskFilter === "next-7-days") {
    return dueDate >= today && dueDate <= nextSevenDays
  }

  return true
}

export { emitTasksUpdated, getPageCount, getPaginatedTasks, matchesTaskFilter }
