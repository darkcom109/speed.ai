import type { GithubData } from "@/app/github/types/github-profile"
import { apiClient } from "@/lib/api-client"

export async function getGithubData(username: string): Promise<GithubData> {
  const { data } = await apiClient.get<GithubData>(`/github/${encodeURIComponent(username)}`)

  return data
}
