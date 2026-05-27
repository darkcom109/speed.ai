import type { GithubData } from "@/app/github/types/github-profile"

export async function getGithubData(username: string): Promise<GithubData> {
  const response = await fetch(`http://localhost:3001/api/github/${username}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load GitHub data")
  }

  return data
}
