import type { 
  Dispatch, FormEventHandler, SetStateAction 
} from "react"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StationSearchFormProps = {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  isSearching: boolean
  onSearchStations: FormEventHandler<HTMLFormElement>
}

export default function StationSearchForm({
  query,
  setQuery,
  isSearching,
  onSearchStations,
}: StationSearchFormProps) {
  return (
    <form
      onSubmit={onSearchStations}
      className="flex max-w-2xl items-center gap-2 rounded-lg border bg-card p-2"
    >
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search station"
        className="h-10 border-0 bg-muted/60 shadow-none focus-visible:ring-0"
      />
      <Button type="submit" className="h-10" disabled={isSearching}>
        <SearchIcon className="size-4" />
        Search
      </Button>
    </form>
  )
}
