import { useEffect, useState } from "react"
import { getTflStatus } from "@/app/transport/api/tfl-api"
import type { TflLineStatus } from "@/app/transport/types/tfl-status"
import { getLineStatusGroups } from "@/app/transport/utils/transport-utils"
import { apiClient } from "@/lib/api-client"
import { useNavigate } from "react-router"

/**
 * Loads live TfL line status and derives good/disrupted line groups.
 *
 * @returns TfL line status state, derived line groups, and a refresh handler.
 */
export default function useTransportStatus() {
  const [lines, setLines] = useState<TflLineStatus[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  async function loadTflStatus() {
    try {
      setError("")
      setIsLoading(true)

      const data = await getTflStatus()

      setLines(data.lines)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load TfL status"
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let shouldIgnore = false

    async function loadInitialTflStatus() {
      try {
        await apiClient.get("/auth/me")
      } catch {
        if (!shouldIgnore) {
          navigate("/login")
        }

        return
      }

      try {
        const data = await getTflStatus()

        if (!shouldIgnore) {
          setLines(data.lines)
        }
      } catch (error) {
        if (!shouldIgnore) {
          setError(
            error instanceof Error ? error.message : "Unable to load TfL status"
          )
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialTflStatus()

    return () => {
      shouldIgnore = true
    }
  }, [navigate])

  const { disruptedLines, goodServiceLines } = getLineStatusGroups(lines)

  return {
    lines,
    error,
    isLoading,
    disruptedLines,
    goodServiceLines,
    loadTflStatus,
  }
}
