export function toDateTimeLocalValue(date: string) {
  const dueDate = new Date(date)
  const timezoneOffset = dueDate.getTimezoneOffset()
  const localDate = new Date(dueDate.getTime() - timezoneOffset * 60 * 1000)

  return localDate.toISOString().slice(0, 16)
}

export function formatTaskDueDateTime(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatTaskDueTime(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}
