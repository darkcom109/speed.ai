import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js"
import { buildResearchPrompt } from "#assistant/prompts/research-prompt.js"
import { researchRequestSchema } from "#schemas/research-schemas.js"

import { assistantRouter } from "../assistant-router.js"

const parsedFetchTimeout = Number.parseInt(process.env.RESEARCH_FETCH_TIMEOUT_MS || "", 10)
const sourceFetchTimeoutMs = Number.isFinite(parsedFetchTimeout)
  ? Math.min(60_000, Math.max(5_000, parsedFetchTimeout))
  : 20_000

const researchStrategies = [
  "Prioritize authoritative and primary sources before secondary commentary.",
  "Start broad, then narrow the search using the strongest terminology discovered.",
  "Look for recent evidence and corroborate important claims across independent sources.",
  "Prefer practical examples, concrete evidence, and sources that explain their methodology.",
  "Explore more than one perspective before deciding which evidence is strongest.",
]

function chooseResearchStrategy() {
  return researchStrategies[Math.floor(Math.random() * researchStrategies.length)]
}

function rotateResults(results) {
  if (results.length < 2) {
    return results
  }

  const offset = Math.floor(Math.random() * results.length)
  return [...results.slice(offset), ...results.slice(0, offset)]
}

function normalizeResults(results) {
  if (!Array.isArray(results)) {
    return []
  }

  const normalized = results
    .filter((result) => typeof result?.url === "string" && result.url)
    .map((result) => ({
      title: typeof result?.title === "string" ? result.title : "",
      url: result.url,
      content: typeof result?.content === "string" ? result.content : "",
    }))

  return rotateResults(normalized).slice(0, 5)
}

async function runWebSearch(query) {
  const response = await fetch("https://ollama.com/api/web_search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      max_results: 8,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Web search failed")
  }

  return normalizeResults(data.results)
}

async function runWebFetch(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), sourceFetchTimeoutMs)

  try {
    const response = await fetch("https://ollama.com/api/web_fetch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Web fetch failed")
    }

    return {
      title: typeof data.title === "string" ? data.title : "",
      content: typeof data.content === "string" ? data.content.slice(0, 3000) : "",
      links: Array.isArray(data.links) ? data.links.filter((link) => typeof link === "string") : [],
    }
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Source inspection timed out after ${Math.round(sourceFetchTimeoutMs / 1000)} seconds`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function compactText(value, limit = 320) {
  if (typeof value !== "string") {
    return ""
  }

  const collapsed = value.replace(/\s+/g, " ").trim()

  if (collapsed.length <= limit) {
    return collapsed
  }

  return `${collapsed.slice(0, limit - 1)}…`
}

function buildResearchContext(context) {
  return {
    goal: compactText(context.goal, 300),
    prompt: compactText(context.prompt, 400),
    instruction: compactText(context.instruction, 220),
    strategy: compactText(context.loop?.strategy, 220),
    loop: {
      iterations: Array.isArray(context.loop?.iterations)
        ? context.loop.iterations.slice(-6).map((item) => ({
            type: item.type,
            query: compactText(item.query, 240),
            url: compactText(item.url, 240),
            reason: compactText(item.reason, 180),
          }))
        : [],
      searches: Array.isArray(context.loop?.searches)
        ? context.loop.searches.slice(-3).map((search) => ({
            query: compactText(search.query, 240),
            results: Array.isArray(search.results)
              ? search.results.slice(0, 3).map((result) => ({
                  title: compactText(result.title, 160),
                  url: compactText(result.url, 240),
                  content: compactText(result.content, 260),
                }))
              : [],
          }))
        : [],
      fetches: Array.isArray(context.loop?.fetches)
        ? context.loop.fetches.slice(-2).map((fetch) => ({
            title: compactText(fetch.title, 160),
            content: compactText(fetch.content, 500),
            links: Array.isArray(fetch.links) ? fetch.links.slice(0, 5).map((link) => compactText(link, 240)) : [],
          }))
        : [],
      findings: Array.isArray(context.loop?.findings)
        ? context.loop.findings.slice(-5).map((finding) => compactText(finding, 260))
        : [],
      sources: Array.isArray(context.loop?.sources)
        ? context.loop.sources.slice(-6).map((source) => ({
            title: compactText(source.title, 160),
            url: compactText(source.url, 240),
            snippet: compactText(source.snippet, 260),
          }))
        : [],
    },
  }
}

async function askResearchModel(context) {
  const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      stream: false,
      think: true,
      messages: [
        { role: "system", content: buildResearchPrompt() },
        { role: "system", content: `Current date: ${new Date().toISOString()}` },
        { role: "user", content: JSON.stringify(buildResearchContext(context)) },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Research model failed")
  }

  return data.message?.content || ""
}

function buildFallbackSearchQuery(goal, prompt) {
  return [goal, prompt].map((part) => part.trim()).filter(Boolean).join(" ")
}

assistantRouter.post("/research", async (req, res) => {
  const validationResult = researchRequestSchema.safeParse(req.body)

  if (!validationResult.success) {
    return res.status(400).json({
      error: validationResult.error.issues[0].message,
    })
  }

  const { goal, prompt = "", maxIterations = 4 } = validationResult.data
  const minimumResearchActions = 2
  const streamProgress = req.query.stream === "1" || req.headers["x-stream-progress"] === "1"

  const loop = {
    goal,
    prompt,
    strategy: chooseResearchStrategy(),
    iterations: [],
    searches: [],
    fetches: [],
    findings: [],
    sources: [],
  }

  const sendProgress = (payload) => {
    if (!streamProgress) {
      return
    }

    res.write(`${JSON.stringify(payload)}\n`)
  }

  try {
    if (streamProgress) {
      res.setHeader("Content-Type", "application/x-ndjson")
      res.setHeader("Cache-Control", "no-cache, no-transform")
      res.setHeader("Connection", "keep-alive")
      res.flushHeaders?.()
    }

    sendProgress({
      type: "status",
      stage: "plan",
      message: "Planning the research...",
      loop,
    })

    let nextAction = await askResearchModel({
      goal,
      prompt,
      loop,
      instruction: "Choose the first research step.",
    })

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
      const parsedAction = JSON.parse(cleanJsonResponse(nextAction))

      if (parsedAction.type === "search" && typeof parsedAction.query === "string") {
        sendProgress({
          type: "status",
          stage: "search",
          message: `Searching for: ${parsedAction.query}`,
          loop,
        })

        const results = await runWebSearch(parsedAction.query)
        loop.iterations.push({
          type: "search",
          query: parsedAction.query,
          reason: typeof parsedAction.reason === "string" ? parsedAction.reason : "",
        })
        loop.searches.push({
          query: parsedAction.query,
          results,
        })
        loop.sources.push(...results)

        sendProgress({
          type: "step",
          step: "search",
          message: `Found ${results.length} source${results.length === 1 ? "" : "s"} for the query.`,
          loop,
        })

        nextAction = await askResearchModel({
          goal,
          prompt,
          loop,
          instruction: "Use the search results and decide whether to fetch a source or finish.",
        })
        continue
      }

      if (parsedAction.type === "fetch" && typeof parsedAction.url === "string") {
        sendProgress({
          type: "status",
          stage: "fetch",
          message: `Fetching: ${parsedAction.url}`,
          loop,
        })

        let fetched

        try {
          fetched = await runWebFetch(parsedAction.url)
        } catch (error) {
          const failureMessage = error instanceof Error ? error.message : "Source inspection failed"

          loop.iterations.push({
            type: "fetch",
            url: parsedAction.url,
            reason: `Skipped source: ${failureMessage}`,
          })

          sendProgress({
            type: "step",
            step: "fetch",
            message: `${failureMessage}. Continuing with another source.`,
            loop,
          })

          nextAction = await askResearchModel({
            goal,
            prompt,
            loop,
            instruction: `The source ${parsedAction.url} could not be inspected: ${failureMessage}. Do not select that URL again. Search or choose another source.`,
          })
          continue
        }

        loop.iterations.push({
          type: "fetch",
          url: parsedAction.url,
          reason: typeof parsedAction.reason === "string" ? parsedAction.reason : "",
        })
        loop.fetches.push(fetched)

        sendProgress({
          type: "step",
          step: "fetch",
          message: `Fetched ${fetched.title || parsedAction.url}.`,
          loop,
        })

        nextAction = await askResearchModel({
          goal,
          prompt,
          loop,
          instruction: "Use the fetched page content and decide whether to continue researching or finish.",
        })
        continue
      }

      if (parsedAction.type === "final") {
        if (loop.iterations.length < minimumResearchActions) {
          sendProgress({
            type: "status",
            stage: "search",
            message: "The agent tried to finish too early. Forcing one more search.",
            loop,
          })

          const fallbackQuery = buildFallbackSearchQuery(goal, prompt)
          const results = await runWebSearch(fallbackQuery)

          loop.iterations.push({
            type: "search",
            query: fallbackQuery,
            reason: "Forced continuation because the agent tried to finish too early.",
          })
          loop.searches.push({
            query: fallbackQuery,
            results,
          })
          loop.sources.push(...results)

          sendProgress({
            type: "step",
            step: "search",
            message: `Forced extra search found ${results.length} source${results.length === 1 ? "" : "s"}.`,
            loop,
          })

          nextAction = await askResearchModel({
            goal,
            prompt,
            loop,
            instruction: "You must continue researching. Return a search or fetch action, not a final answer yet.",
          })

          continue
        }

        const payload = {
          goal,
          prompt,
          loop,
          message: typeof parsedAction.message === "string" ? parsedAction.message : "Research complete.",
          findings: Array.isArray(parsedAction.findings) ? parsedAction.findings.filter((item) => typeof item === "string") : [],
          sources: Array.isArray(parsedAction.sources)
            ? parsedAction.sources.filter((item) => item && typeof item === "object")
            : loop.sources,
          done: true,
        }

        if (streamProgress) {
          sendProgress({ type: "done", ...payload })
          return res.end()
        }

        return res.status(200).json(payload)
      }

      break
    }

    sendProgress({
      type: "status",
      stage: "synth",
      message: "Synthesizing final answer...",
      loop,
    })

    const finalAnswer = await askResearchModel({
      goal,
      prompt,
      loop,
      instruction: "Summarize the research so far in final form. You may only finish now.",
    })

    const parsedFinal = JSON.parse(cleanJsonResponse(finalAnswer))

    const payload = {
      goal,
      prompt,
      loop,
      message: typeof parsedFinal.message === "string" ? parsedFinal.message : "Research complete.",
      findings: Array.isArray(parsedFinal.findings) ? parsedFinal.findings.filter((item) => typeof item === "string") : [],
      sources: Array.isArray(parsedFinal.sources)
        ? parsedFinal.sources.filter((item) => item && typeof item === "object")
        : loop.sources,
      done: true,
    }

    if (streamProgress) {
      sendProgress({ type: "done", ...payload })
      return res.end()
    }

    return res.status(200).json(payload)
  } catch (error) {
    console.error("Research engine failed:", error)

    if (streamProgress) {
      sendProgress({
        type: "error",
        error: error instanceof Error ? error.message : "Research engine failed",
      })
      return res.end()
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Research engine failed",
    })
  }
})
