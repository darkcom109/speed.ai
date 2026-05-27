import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  created: {
    label: "Created",
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

function getLastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    date.setHours(0, 0, 0, 0)

    return date
  })
}

export default function TaskActivityChart({
  tasks,
  error,
  isLoading,
}: TaskActivityChartProps) {
  const chartData = getLastSevenDays().map((date) => {
    const created = tasks.filter((task) =>
      isSameDay(new Date(task.createdAt), date)
    ).length
    const completed = tasks.filter((task) => {
      return task.completed && isSameDay(new Date(task.updatedAt), date)
    }).length

    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      created,
      completed,
    }
  })
  const hasActivity = chartData.some(
    (day) => day.created > 0 || day.completed > 0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task activity</CardTitle>
        <CardDescription>Created and completed tasks this week</CardDescription>
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
              <BarChart data={chartData}>
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
                <Bar
                  dataKey="created"
                  fill="var(--color-created)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
            {!hasActivity && (
              <p className="mt-3 text-sm text-muted-foreground">
                No task activity this week yet.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
