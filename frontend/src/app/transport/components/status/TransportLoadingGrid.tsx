export default function TransportLoadingGrid() {
  return (
    <div className="grid gap-2 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-lg border bg-muted/50"
        />
      ))}
    </div>
  )
}
