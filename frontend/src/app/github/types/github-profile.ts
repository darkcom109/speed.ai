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
    summary: string
    strengths: string[]
    improvements: string[]
  } | null
}
