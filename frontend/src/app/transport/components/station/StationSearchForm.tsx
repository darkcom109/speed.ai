import type { Dispatch, FormEventHandler, SetStateAction } from "react"
import { LoaderCircleIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StationSearchFormProps = {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  isSearching: boolean
  onSearchStations: FormEventHandler<HTMLFormElement>
  prominent?: boolean
}

export default function StationSearchForm({
  query,
  setQuery,
  isSearching,
  onSearchStations,
  prominent = false,
}: StationSearchFormProps) {
  return (
    <form
      onSubmit={onSearchStations}
      className={`flex w-full items-center rounded-lg border bg-card shadow-sm ${
        prominent
          ? "mx-auto h-14 gap-2 px-2"
          : "h-10 min-w-0 flex-1 gap-1 pr-1 pl-3"
      }`}
    >
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search station"
        autoFocus={prominent}
        className={`${prominent ? "text-base" : "text-sm"} h-full rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent`}
      />
      <Button
        type="submit"
        className={prominent ? "h-10 px-5" : "h-8"}
        disabled={isSearching || !query.trim()}
      >
        {isSearching ? (
          <LoaderCircleIcon className="size-4 animate-spin" />
        ) : (
          <SearchIcon className="size-4" />
        )}
        Search
      </Button>
    </form>
  )
}
