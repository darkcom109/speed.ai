import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type Theme } from "@/components/theme-provider"

type AppearanceOptionsProps = {
  theme: Theme
  setTheme: (set: Theme) => void
}

export default function AppearanceOptions({
  theme,
  setTheme,
}: AppearanceOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how speed.ai should look on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid max-w-lg grid-cols-3 gap-1 rounded-lg border bg-muted/30 p-1">
          <Button
            type="button"
            variant={theme === "light" ? "default" : "outline"}
            className="justify-center border-0 shadow-none"
            onClick={() => setTheme("light")}
          >
            <SunIcon />
            Light
          </Button>
          <Button
            type="button"
            variant={theme === "dark" ? "default" : "outline"}
            className="justify-center border-0 shadow-none"
            onClick={() => setTheme("dark")}
          >
            <MoonIcon />
            Dark
          </Button>
          <Button
            type="button"
            variant={theme === "system" ? "default" : "outline"}
            className="justify-center border-0 shadow-none"
            onClick={() => setTheme("system")}
          >
            <MonitorIcon />
            System
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
