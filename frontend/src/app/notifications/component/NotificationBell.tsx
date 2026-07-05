import { BellIcon, Volume2Icon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import useNotifications from "@/app/notifications/hooks/useNotifications"

export default function NotificationBell() {
  const {
    notifications,
    error,
    isLoading,
    activeAlarm,
    dismissAlarm,
  } = useNotifications()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" className="relative">
            <BellIcon className="size-4" />

            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium leading-4 text-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="border-b p-3">
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-muted-foreground">
              Task reminders and due dates.
            </p>
          </div>

          <div className="notification-scroll max-h-48 overflow-y-auto p-2">
            {isLoading && (
              <p className="p-3 text-sm text-muted-foreground">
                Loading notifications...
              </p>
            )}

            {error && <p className="p-3 text-sm text-red-500">{error}</p>}

            {!isLoading && !error && notifications.length === 0 && (
              <p className="p-3 text-sm text-muted-foreground">
                No notifications right now.
              </p>
            )}

            {!isLoading &&
              !error &&
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-md p-3 hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {notification.priority}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeAlarm ? (
        <div className="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-border/80 bg-card p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Volume2Icon className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Alarm</p>
              <p className="mt-1 text-sm text-muted-foreground">{activeAlarm.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{activeAlarm.message}</p>

              <div className="mt-3 flex items-center justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full px-4"
                  onClick={dismissAlarm}
                >
                  <XIcon className="size-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
