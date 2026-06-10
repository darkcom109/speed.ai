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
      className={`relative overflow-hidden rounded-lg border ${compact ? "p-3" : "p-4"} ${styles.card}`}
    >
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: getLineColor(line) }}
      />
      <div className="flex items-start gap-3 pl-2">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-md ${styles.icon}`}
        >
          <StatusIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium">{line.name}</h3>
              <p className="text-xs text-muted-foreground">
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
            <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">
              {line.reason}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
