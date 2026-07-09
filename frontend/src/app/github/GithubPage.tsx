import {
  ArrowRightIcon,
  BadgeInfoIcon,
  CodeIcon,
  ExternalLinkIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react"

import Layout from "@/components/app/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useGithub from "@/app/github/hooks/useGithub"

export default function GithubPage() {
  const { username, githubData, error, isLoading, setUsername, handleSearchGithub } =
    useGithub()

  return (
    <Layout>
      <div className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Rate My GitHub</h2>
          <p className="text-sm text-muted-foreground">
            Type a GitHub username and get a score out of 100, plus what&apos;s working and what
            could improve.
          </p>
        </header>

        <section className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
          <form onSubmit={handleSearchGithub} className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="github username"
                  className="h-12 rounded-2xl pl-10"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="h-12 rounded-2xl px-5">
                {isLoading ? "Rating..." : "Rate profile"}
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              We fetch the public profile, recent repos, and activity, then ask Ollama for a
              concise score and review.
            </p>
          </form>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </section>

        {!githubData ? (
          <section className="rounded-[28px] border border-dashed border-border/70 bg-muted/10 p-8 text-sm text-muted-foreground">
            Enter a username above to generate a rating.
          </section>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
            <section className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <img
                  src={githubData.profile.avatarUrl}
                  alt={githubData.profile.username}
                  className="size-16 rounded-2xl border border-border/70"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold">
                      {githubData.profile.name || githubData.profile.username}
                    </h3>
                    <Badge variant="secondary" className="rounded-full">
                      {githubData.rating?.score ?? 0}/100
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    @{githubData.profile.username}
                  </p>
                  <a
                    href={githubData.profile.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Open GitHub
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                </div>
              </div>

              {githubData.profile.bio && (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {githubData.profile.bio}
                </p>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-2xl border border-border/70 bg-background p-3">
                  <p className="font-semibold">{githubData.profile.publicRepos}</p>
                  <p className="text-xs text-muted-foreground">Repos</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-3">
                  <p className="font-semibold">{githubData.profile.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-3">
                  <p className="font-semibold">{githubData.profile.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex items-center gap-2">
                  <BadgeInfoIcon className="size-4 text-primary" />
                  <p className="text-sm font-medium">AI verdict</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {githubData.rating?.summary || "No rating generated."}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <StarIcon className="size-4 text-primary" />
                  <h3 className="text-sm font-medium">Strengths</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(githubData.rating?.strengths || []).map((item) => (
                    <li key={item} className="rounded-2xl border border-border/70 bg-background p-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <CodeIcon className="size-4 text-primary" />
                  <h3 className="text-sm font-medium">Improvement ideas</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(githubData.rating?.improvements || []).map((item) => (
                    <li key={item} className="rounded-2xl border border-border/70 bg-background p-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  )
}
