export type RenderDaysOfWeekProps = {
    weekDays: string[]
}

export default function RenderDaysOfWeek({ weekDays } : RenderDaysOfWeekProps) {
    return (
        <div className="grid grid-cols-7">
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