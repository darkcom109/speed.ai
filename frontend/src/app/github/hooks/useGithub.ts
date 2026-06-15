import { useState, type FormEvent } from "react"
import { getGithubData } from "@/app/github/api/github-api"
import type { GithubData } from "@/app/github/types/github-profile"

export default function useGithub() {
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

  return {
    username,
    githubData,
    error,
    isLoading,
    setUsername,
    handleSearchGithub
  }
}