import { useState } from "react"
import {
  CodeIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  SearchIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"
import type { FormEvent } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getGithubData } from "@/app/github/api/github-api"
import type { GithubData } from "@/app/github/types/github-profile"

export default function GithubPage() {
  const [username, setUsername] = useState("")
  const [githubData, setGithubData] = useState<GithubData | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSearchGithub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUsername = username.trim()

    if (!trimmedUsername) {
      return
    }

    try {
      setError("")
      setIsLoading(true)

      const data = await getGithubData(trimmedUsername)

      setGithubData(data)
    } catch (error) {
      setGithubData(null)
      setError(error instanceof Error ? error.message : "Unable to load GitHub data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="GitHub" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">GitHub</h2>
            <p className="text-sm text-muted-foreground">
              Search a public GitHub profile and view recent activity.
            </p>
          </div>

          <form
            onSubmit={handleSearchGithub}
            className="flex max-w-xl items-center gap-2 rounded-lg border bg-card p-2"
          >
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="GitHub username"
              className="border-0 shadow-none focus-visible:ring-0"
            />
            <Button type="submit" disabled={isLoading}>
              <SearchIcon className="size-4" />
              Search
            </Button>
          </form>

          {isLoading && <p className="text-sm text-muted-foreground">Loading GitHub data...</p>}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {githubData && (
            <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
              <section className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={githubData.profile.avatarUrl}
                    alt={githubData.profile.username}
                    className="size-16 rounded-lg border"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">
                      {githubData.profile.name || githubData.profile.username}
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">
                      @{githubData.profile.username}
                    </p>
                    <a
                      href={githubData.profile.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View profile
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  </div>
                </div>

                {githubData.profile.bio && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {githubData.profile.bio}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-md border bg-background p-2">
                    <p className="font-semibold">{githubData.profile.publicRepos}</p>
                    <p className="text-xs text-muted-foreground">Repos</p>
                  </div>
                  <div className="rounded-md border bg-background p-2">
                    <p className="font-semibold">{githubData.profile.followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="rounded-md border bg-background p-2">
                    <p className="font-semibold">{githubData.profile.following}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border bg-card">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-medium">Recently updated repos</h3>
                </div>
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  {githubData.repos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border bg-background p-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{repo.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {repo.description || "No description"}
                          </p>
                        </div>
                        <CodeIcon className="size-4 shrink-0 text-muted-foreground" />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {repo.language && <span>{repo.language}</span>}
                        <span className="inline-flex items-center gap-1">
                          <StarIcon className="size-3.5" />
                          {repo.stars}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GitBranchIcon className="size-3.5" />
                          {repo.forks}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border bg-card xl:col-span-2">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-medium">Recent activity</h3>
                </div>
                <div className="divide-y">
                  {githubData.activity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 px-4 py-3 text-sm"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <UsersIcon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{activity.type}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {activity.repo} - {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
