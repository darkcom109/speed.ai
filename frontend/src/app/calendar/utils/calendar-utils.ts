export const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getMonthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

export function getMonthLabel(date: Date) {
  return date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })
}

export function getMonthDays(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return Array.from({ length: daysInMonth }, (_, index) => {
    return new Date(year, month, index + 1)
  })
}

export function getBlankDays(year: number, month: number) {
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  return Array.from({ length: firstDayOfMonth }, (_, index) => index)
}

export function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}
