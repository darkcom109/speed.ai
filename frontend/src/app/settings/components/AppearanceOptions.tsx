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
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant={theme === "light" ? "default" : "outline"}
            className="justify-start"
            onClick={() => setTheme("light")}
          >
            <SunIcon />
            Light
          </Button>
          <Button
            type="button"
            variant={theme === "dark" ? "default" : "outline"}
            className="justify-start"
            onClick={() => setTheme("dark")}
          >
            <MoonIcon />
            Dark
          </Button>
          <Button
            type="button"
            variant={theme === "system" ? "default" : "outline"}
            className="justify-start"
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
