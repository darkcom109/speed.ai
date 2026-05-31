import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Task } from "@/app/tasks/types/task"

type TaskActivityChartProps = {
  tasks: Task[]
  error: string
  isLoading: boolean
}

const chartConfig = {
  current: {
    label: "Current",
    color: "var(--primary)",
  },
  completed: {
    label: "Completed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function getNextSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    date.setHours(0, 0, 0, 0)

    return date
  })
}

export default function TaskActivityChart({
  tasks,
  error,
  isLoading,
}: TaskActivityChartProps) {
  const chartData = getNextSevenDays().map((date) => {
    const dueTasks = tasks.filter((task) => {
      return task.dueDate && isSameDay(new Date(task.dueDate), date)
    })
    const current = dueTasks.filter((task) => !task.completed).length
    const completed = dueTasks.filter((task) => task.completed).length

    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      current,
      completed,
    }
  })
  const hasActivity = chartData.some(
    (day) => day.current > 0 || day.completed > 0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming workload</CardTitle>
        <CardDescription>Tasks due over the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !error && (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!isLoading && !error && (
          <>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-64 w-full"
            >
              <AreaChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="current"
                  type="monotone"
                  fill="var(--color-current)"
                  fillOpacity={0.25}
                  stroke="var(--color-current)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="completed"
                  type="monotone"
                  fill="var(--color-completed)"
                  fillOpacity={0.15}
                  stroke="var(--color-completed)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
            {!hasActivity && (
              <p className="mt-3 text-sm text-muted-foreground">
                No tasks due in the next 7 days.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
