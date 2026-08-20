// Helper function to build date-time objects
export function buildDateTime(timeZone) {
    const now = new Date()

    // Get today's date
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // Get tomorrow's date
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    // Get the day after tomorrow's date
    const dayAfterTomorrowStart = new Date(todayStart)
    dayAfterTomorrowStart.setDate(dayAfterTomorrowStart.getDate() + 2)

    // Get today's date + 1 hour ahead
    const nextHour = new Date(now)
    nextHour.setHours(nextHour.getHours() + 1)

    return { now, todayStart, tomorrowStart, dayAfterTomorrowStart, nextHour, timeZone }
}
