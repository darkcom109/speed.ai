import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "font-sans rounded-md border border-border bg-card text-card-foreground shadow-lg",
          title: "text-sm font-medium text-foreground",
          description: "text-sm text-muted-foreground",
          icon: "text-muted-foreground",
          success:
            "[&_[data-icon]]:text-emerald-600 dark:[&_[data-icon]]:text-emerald-400",
          info: "[&_[data-icon]]:text-foreground",
          warning:
            "[&_[data-icon]]:text-amber-600 dark:[&_[data-icon]]:text-amber-400",
          error: "[&_[data-icon]]:text-destructive",
          actionButton:
            "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground",
          cancelButton:
            "rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground",
          closeButton:
            "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
