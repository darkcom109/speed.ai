import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react"
import { type TflLineStatus } from "@/app/transport/types/tfl-status"

const lineColors: Record<string, string> = {
  bakerloo: "#B36305",
  central: "#E32017",
  circle: "#FFD300",
  district: "#00782A",
  "elizabeth-line": "#6950A1",
  "hammersmith-city": "#F3A9BB",
  jubilee: "#A0A5A9",
  metropolitan: "#9B0056",
  northern: "#000000",
  piccadilly: "#003688",
  victoria: "#0098D4",
  "waterloo-city": "#95CDBA",
  dlr: "#00A4A7",
  "london-overground": "#EE7C0E",
  tram: "#84B817",
}

function getStatusStyles(line: TflLineStatus) {
  if (line.status === "Good Service") {
    return {
      card: "border-border bg-card",
      icon: "bg-primary/10 text-primary",
      badge: "bg-primary/10 text-primary",
      iconComponent: CheckCircle2Icon,
    }
  }

  return {
    card: "border-destructive/40 bg-destructive/5",
    icon: "bg-destructive/10 text-destructive",
    badge: "bg-destructive/10 text-destructive",
    iconComponent: AlertTriangleIcon,
  }
}

function getLineColor(line: TflLineStatus) {
  return lineColors[line.id] || "var(--primary)"
}

function formatModeName(modeName: string) {
  return modeName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getLineStatusGroups(lines: TflLineStatus[]) {
  return {
    disruptedLines: lines.filter((line) => line.status !== "Good Service"),
    goodServiceLines: lines.filter((line) => line.status === "Good Service"),
  }
}

export {
  lineColors,
  getStatusStyles,
  getLineColor,
  formatModeName,
  getLineStatusGroups,
}
