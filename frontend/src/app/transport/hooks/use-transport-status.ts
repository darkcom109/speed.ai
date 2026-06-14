import { useEffect, useState } from "react"
import { getTflStatus } from "@/app/transport/api/tfl-api"
import type { TflLineStatus } from "@/app/transport/types/tfl-status"
import { getLineStatusGroups } from "@/app/transport/utils/transport-utils"
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
      setError(error instanceof Error ? error.message : "Unable to load TfL status")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let shouldIgnore = false

    async function loadInitialTflStatus() {
      try {
        const response = await fetch("http://localhost:3001/api/auth/me")

        if (!response.ok) {
          navigate("/login")
        }
        
        const data = await getTflStatus()

        if (!shouldIgnore) {
          setLines(data.lines)
        }
      } catch (error) {
        if (!shouldIgnore) {
          setError(error instanceof Error ? error.message : "Unable to load TfL status")
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
  }, [])

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
