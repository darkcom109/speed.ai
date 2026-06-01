import { BotIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import NotificationBell from "@/app/notifications/component/NotificationBell"
import { Button } from "@/components/ui/button"
import { assistantToggleEvent } from "@/components/global-assistant-sidebar"

export function SiteHeader({ title = "Documents" }: { title?: string }) {
  function handleAssistantToggle() {
    window.dispatchEvent(new Event(assistantToggleEvent))
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Open assistant"
            title="Assistant"
            onClick={handleAssistantToggle}
          >
            <BotIcon />
          </Button>
        </div>
      </div>
    </header>
  )
}
