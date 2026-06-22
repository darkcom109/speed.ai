import { type ChartConfig } from "@/components/ui/chart"

export const chartConfig = {
  good: {
    label: "Good service",
    color: "var(--primary)",
  },
  disrupted: {
    label: "Disrupted",
    color: "var(--destructive)",
  },
} satisfies ChartConfig