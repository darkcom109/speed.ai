import { RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type TransportHeaderProps = {
  isLoading: boolean
  onRefresh: () => void
}

export default function TransportHeader({
  isLoading,
  onRefresh,
}: TransportHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">TfL status</h2>
        <p className="text-sm text-muted-foreground">
          Live service status for London rail lines.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCwIcon className="size-4" />
        Refresh
      </Button>
    </div>
  )
}
