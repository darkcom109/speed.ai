import type { Weather } from "@/app/dashboard/types/weather"

type WeatherCardProps = {
  weather: Weather | null
  error: string
  isLoading: boolean
}

export default function WeatherCard({
  weather,
  error,
  isLoading,
}: WeatherCardProps) {
  return (
    <section className="w-full max-w-xs rounded-lg border bg-card p-3">
      <h3 className="text-sm font-medium">Weather</h3>

      {isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {weather && (
        <div className="mt-2">
          <p className="text-2xl font-semibold">{weather.temperature} degrees</p>
          <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
            <p>Rain chance: {weather.rainChance}%</p>
            <p>Precipitation: {weather.precipitation}mm</p>
            <p>{weather.timezone}</p>
          </div>
        </div>
      )}
    </section>
  )
}
