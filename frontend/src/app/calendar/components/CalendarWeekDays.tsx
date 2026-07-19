export type CalendarWeekDaysProps = {
  weekDays: string[]
  embedded?: boolean
}

export default function CalendarWeekDays({
  weekDays,
  embedded = false,
}: CalendarWeekDaysProps) {
  return (
    <div
      className={embedded ? "grid grid-cols-7 border-b" : "grid grid-cols-7"}
    >
      {weekDays.map((weekDay) => (
        <div
          key={weekDay}
          className="px-2 py-2 text-xs font-medium text-muted-foreground"
        >
          {weekDay}
        </div>
      ))}
    </div>
  )
}
