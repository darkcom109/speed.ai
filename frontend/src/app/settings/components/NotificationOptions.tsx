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

  const toggleClassName =
    "relative h-6 w-11 shrink-0 rounded-full border p-0 transition-colors " +
    "after:absolute after:left-0 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Control reminder alerts and the alarm sound for task notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canShowBrowserNotifications && browserNotificationPermission !== "granted" ? (
          <Button type="button" variant="outline" size="sm" className="mb-4" onClick={enableBrowserNotifications}>
            <BellIcon />
            Enable browser alerts
          </Button>
        ) : null}

        <div className="divide-y rounded-lg border">
          <div className="flex min-h-16 items-center justify-between gap-6 px-4 py-3">
            <div className="flex items-center gap-3">
              <BellIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Browser notifications</p>
                <p className="text-xs text-muted-foreground">Show task reminders outside the app.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={browserAlertsEnabled}
              aria-label="Toggle browser notifications"
              className={`${toggleClassName} ${
                browserAlertsEnabled
                  ? "border-primary bg-primary after:translate-x-5"
                  : "border-border bg-muted after:translate-x-0.5"
              }`}
              onClick={() =>
                browserAlertsEnabled ? disableBrowserNotifications() : enableBrowserNotifications()
              }
            />
          </div>

          <div className="flex min-h-16 items-center justify-between gap-6 px-4 py-3">
            <div className="flex items-center gap-3">
              <Volume2Icon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Notification sound</p>
                <p className="text-xs text-muted-foreground">Play a sound when reminders arrive.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Toggle notification sound"
              className={`${toggleClassName} ${
                soundEnabled
                  ? "border-primary bg-primary after:translate-x-5"
                  : "border-border bg-muted after:translate-x-0.5"
              }`}
              onClick={() => (soundEnabled ? disableSound() : enableSound())}
            />
          </div>

          <div className="flex min-h-16 items-center justify-between gap-6 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Sound style</p>
              <p className="text-xs text-muted-foreground">Choose the alarm tone.</p>
            </div>
            <Select value={soundType} onValueChange={(value) => setNotificationSoundType(value as typeof soundType)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beep">Beep</SelectItem>
                <SelectItem value="double">Double beep</SelectItem>
                <SelectItem value="chime">Chime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-16 items-center justify-between gap-8 px-4 py-3">
            <div className="shrink-0">
              <p className="text-sm font-medium">Volume</p>
              <p className="text-xs text-muted-foreground">Alarm and reminder level.</p>
            </div>
            <div className="flex w-full max-w-sm items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(event) => setNotificationSoundVolume(Number(event.target.value))}
                className="min-w-0 flex-1 accent-primary"
              />
              <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
