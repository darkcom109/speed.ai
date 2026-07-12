import {
  ActivityIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  ExternalLinkIcon,
  GitForkIcon,
  GitBranchIcon,
  LightbulbIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react"

import Layout from "@/components/app/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useGithub from "@/app/github/hooks/useGithub"

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-sky-500"
  if (score >= 40) return "text-amber-500"
  return "text-rose-500"
}

export default function GithubPage() {
  const { username, githubData, error, isLoading, setUsername, handleSearchGithub } =
    useGithub()
  const rating = githubData?.rating

  return (
    <Layout title="GitHub">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">Rate My GitHub</h2>
        <p className="text-sm text-muted-foreground">
          Get an evidence-based review of a public GitHub portfolio.
        </p>
      </header>

      <form
        onSubmit={handleSearchGithub}
        className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row"
      >
        <div className="relative min-w-0 flex-1">
          <GitBranchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter a GitHub username"
            aria-label="GitHub username"
            className="h-10 pl-10"
          />
        </div>
        <Button type="submit" disabled={isLoading || !username.trim()}>
          {isLoading ? "Evaluating profile..." : "Evaluate profile"}
          {!isLoading && <ArrowRightIcon />}
        </Button>
      </form>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {!githubData || !rating ? (
        <section className="flex min-h-72 flex-col items-center justify-center border-y text-center">
          <span className="flex size-10 items-center justify-center rounded-lg border bg-muted/30">
            <SearchIcon className="size-5 text-muted-foreground" />
          </span>
          <h3 className="mt-4 font-medium">No profile evaluated</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Enter a username to score profile quality, portfolio, documentation,
            recent activity, and community impact.
          </p>
        </section>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-6 rounded-lg border bg-card p-5 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-center">
            <div className="flex min-w-0 items-start gap-4">
              <img
                src={githubData.profile.avatarUrl}
                alt=""
                className="size-16 shrink-0 rounded-lg border object-cover"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-xl font-semibold">
                    {githubData.profile.name || githubData.profile.username}
                  </h3>
                  <Badge variant="outline">@{githubData.profile.username}</Badge>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {githubData.profile.bio || "No profile bio has been added yet."}
                </p>
                <a
                  href={githubData.profile.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                >
                  View public profile
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="border-t pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-xs font-medium uppercase text-muted-foreground">Overall score</p>
              <div className="mt-1 flex items-end gap-2">
                <span className={`text-5xl font-semibold tabular-nums ${scoreTone(rating.score)}`}>
                  {rating.score}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary">Grade {rating.grade}</Badge>
                <span className="text-xs text-muted-foreground">Evidence checked</span>
              </div>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
            <section className="rounded-lg border bg-card">
              <div className="border-b px-5 py-4">
                <h3 className="font-semibold">Score breakdown</h3>
                <p className="text-sm text-muted-foreground">
                  Weighted from public profile and repository evidence.
                </p>
              </div>
              <div className="divide-y">
                {rating.categories.map((category) => {
                  const percentage = Math.round((category.score / category.maxScore) * 100)

                  return (
                    <div key={category.key} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium">{category.label}</p>
                        <p className="text-sm font-semibold tabular-nums">
                          {category.score}
                          <span className="font-normal text-muted-foreground">
                            /{category.maxScore}
                          </span>
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {category.evidence}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-2">
                <ActivityIcon className="size-4 text-muted-foreground" />
                <h3 className="font-semibold">Evaluation</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{rating.summary}</p>

              <dl className="mt-5 grid grid-cols-2 border-y">
                {[
                  ["Original repos", rating.metrics.originalRepos],
                  ["Languages", rating.metrics.languages],
                  ["README coverage", `${rating.metrics.readmeCoverage}%`],
                  ["Descriptions", `${rating.metrics.descriptionCoverage}%`],
                  ["Stars", rating.metrics.totalStars],
                  ["Recent events", rating.metrics.recentEvents],
                ].map(([label, value]) => (
                  <div key={label} className="border-b px-1 py-3 odd:border-r last:border-b-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-500" />
                <h3 className="font-semibold">What works</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {rating.strengths.map((strength) => (
                  <li key={strength} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {strength}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-2">
                <LightbulbIcon className="size-4 text-amber-500" />
                <h3 className="font-semibold">Next improvements</h3>
              </div>
              <ol className="mt-4 space-y-3">
                {rating.improvements.map((improvement, index) => (
                  <li key={improvement} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded border text-[11px] font-medium">
                      {index + 1}
                    </span>
                    {improvement}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="font-semibold">Reviewed repositories</h3>
                <p className="text-sm text-muted-foreground">Most recently updated public work.</p>
              </div>
              <Badge variant="outline">{githubData.repos.length} reviewed</Badge>
            </div>
            <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
              {githubData.repos.slice(0, 6).map((repo) => (
                <a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-w-0 items-start justify-between gap-4 border-b p-4 last:border-b-0 hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium group-hover:underline">{repo.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {repo.description || "No repository description."}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      {repo.language && <span>{repo.language}</span>}
                      <span className="inline-flex items-center gap-1">
                        <StarIcon className="size-3" /> {repo.stars}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitForkIcon className="size-3" /> {repo.forks}
                      </span>
                      {repo.hasReadme && (
                        <span className="inline-flex items-center gap-1">
                          <BookOpenIcon className="size-3" /> README
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </Layout>
  )
}
