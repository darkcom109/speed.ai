export function formatArrivalTime(seconds: number) {
  const minutes = Math.max(0, Math.round(seconds / 60))

  if (minutes === 0) {
    return "Due"
  }

  return `${minutes} min`
}