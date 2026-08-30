import type { TflLineStatus } from "@/app/transport/types/tfl-status"
import {
  formatModeName,
  getLineColor,
  getStatusStyles,
} from "@/app/transport/utils/transport-utils"

type LineStatusCardProps = {
  line: TflLineStatus
  compact?: boolean
}

export default function LineStatusCard({
  line,
  compact = false,
}: LineStatusCardProps) {
  const styles = getStatusStyles(line)
  const StatusIcon = styles.iconComponent

  return (
    <section
      className={`group relative overflow-hidden rounded-lg border bg-card transition-colors hover:bg-muted/30 ${compact ? "p-3" : "p-4"}`}
    >
      <div
        className="absolute inset-y-3 left-0 w-1 rounded-r-full"
        style={{ backgroundColor: getLineColor(line) }}
      />
      <div className="flex items-start gap-3 pl-1">
        <div
          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${styles.icon}`}
        >
          <StatusIcon className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{line.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatModeName(line.modeName)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${styles.badge}`}
            >
              {line.status}
            </span>
          </div>
          {!compact && line.reason && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {line.reason}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
