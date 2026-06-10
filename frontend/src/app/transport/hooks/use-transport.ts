import { useEffect, useState } from "react"
import { getTflStatus } from "@/app/transport/api/tfl-api"
import type { TflLineStatus } from "@/app/transport/types/tfl-status"

export default function useTransport() {
  const [lines, setLines] = useState<TflLineStatus[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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

  const disruptedLines = lines.filter((line) => line.status !== "Good Service")
  const goodServiceLines = lines.filter((line) => line.status === "Good Service")

  return {
    lines,
    error,
    isLoading,
    disruptedLines,
    goodServiceLines,
    loadTflStatus,
  }
}