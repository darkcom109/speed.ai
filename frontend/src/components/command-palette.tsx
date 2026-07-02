import { useEffect, useState } from "react"
import {
  CalendarDaysIcon,
  CodeIcon,
  LayoutDashboardIcon,
  NotebookTextIcon,
  NetworkIcon,
  ReceiptTextIcon,
  Settings2Icon,
  SquareCheckBigIcon,
  TrainFrontIcon,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,

} from "@/components/ui/command"

const publicRoutes = ["/", "/login", "/signup"]

const navigationCommands = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: SquareCheckBigIcon,
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: CalendarDaysIcon,
  },
  {
    label: "Finances",
    path: "/expenses",
    icon: ReceiptTextIcon,
  },
  {
    label: "Savings",
    path: "/expenses/savings",
    icon: ReceiptTextIcon,
  },
  {
    label: "Notes",
    path: "/notes",
    icon: NotebookTextIcon,
  },
  {
    label: "Workspace Map",
    path: "/workspace-map",
    icon: NetworkIcon,
  },
  {
    label: "GitHub",
    path: "/github",
    icon: CodeIcon,
  },
  {
    label: "Transport",
    path: "/transport/status",
    icon: TrainFrontIcon,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings2Icon,
  },
]

export function CommandPalette() {
  const navigate = useNavigate()
  const location = useLocation()
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCommandShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k"

      if (!isCommandShortcut || isPublicRoute) {
        return
      }

      event.preventDefault()
      setOpen((currentOpen) => !currentOpen)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPublicRoute])

  function runCommand(command: () => void) {
    setOpen(false)
    command()
  }

  if (isPublicRoute) {
    return null
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search navigation and workspace actions."
    >
      <Command>
        <CommandInput placeholder="Search commands..." />
        <CommandList>
          <CommandEmpty>No command found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {navigationCommands.map((command) => (
              <CommandItem
                key={command.path}
                value={command.label}
                onSelect={() => runCommand(() => navigate(command.path))}
              >
                <command.icon />
                <span>{command.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
