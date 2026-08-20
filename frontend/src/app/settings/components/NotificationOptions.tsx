import { BellIcon, Volume2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useNotifications from "@/app/notifications/hooks/useNotifications"

export default function NotificationOptions() {
  const {
    enableBrowserNotifications,
    disableBrowserNotifications,
    enableSound,
    disableSound,
    browserAlertsEnabled,
    soundEnabled,
    soundVolume,
    soundType,
    setNotificationSoundVolume,
    setNotificationSoundType,
    canShowBrowserNotifications,
    browserNotificationPermission,
  } = useNotifications()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Control reminder alerts and the alarm sound for task notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {canShowBrowserNotifications && browserNotificationPermission !== "granted" ? (
          <Button type="button" variant="outline" className="justify-start" onClick={enableBrowserNotifications}>
            <BellIcon />
            Enable browser alerts
          </Button>
        ) : null}

        <Button
          type="button"
          variant={browserAlertsEnabled ? "default" : "outline"}
          className="justify-start"
          onClick={() =>
            browserAlertsEnabled ? disableBrowserNotifications() : enableBrowserNotifications()
          }
        >
          <BellIcon />
          {browserAlertsEnabled ? "Disable notifications" : "Enable notifications"}
        </Button>

        <Button
          type="button"
          variant={soundEnabled ? "default" : "outline"}
          className="justify-start"
          onClick={() => (soundEnabled ? disableSound() : enableSound())}
        >
          <Volume2Icon />
          {soundEnabled ? "Disable sound" : "Enable sound"}
        </Button>

        <div className="grid gap-2 rounded-lg border border-border/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Sound style</p>
              <p className="text-xs text-muted-foreground">Choose the alarm tone.</p>
            </div>
            <Select value={soundType} onValueChange={(value) => setNotificationSoundType(value as typeof soundType)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beep">Beep</SelectItem>
                <SelectItem value="double">Double beep</SelectItem>
                <SelectItem value="chime">Chime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Volume</p>
              <span className="text-xs text-muted-foreground">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(event) => setNotificationSoundVolume(Number(event.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
