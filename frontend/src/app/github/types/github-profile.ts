export type GithubProfile = {
  username: string
  name: string | null
  avatarUrl: string
  bio: string | null
  followers: number
  following: number
  publicRepos: number
  profileUrl: string
}

export type GithubRepo = {
  id: number
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  updatedAt: string
  hasReadme: boolean
}

export type GithubActivity = {
  id: string
  type: string
  repo: string
  createdAt: string
}

export type GithubData = {
  profile: GithubProfile
  repos: GithubRepo[]
  activity: GithubActivity[]
  rating: {
    score: number
    grade: string
    summary: string
    strengths: string[]
    improvements: string[]
    categories: Array<{
      key: string
      label: string
      score: number
      maxScore: number
      evidence: string
    }>
    metrics: {
      originalRepos: number
      languages: number
      totalStars: number
      totalForks: number
      readmeCoverage: number
      descriptionCoverage: number
      recentEvents: number
      activeRepos: number
      latestActivityAt: string | null
    }
    evaluatedAt: string
  } | null
}
