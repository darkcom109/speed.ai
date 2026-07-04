import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js"
import { buildResearchPrompt } from "#assistant/prompts/research-prompt.js"
import { researchRequestSchema } from "#schemas/research-schemas.js"

import { assistantRouter } from "../assistant-router.js"

function normalizeResults(results) {
  if (!Array.isArray(results)) {
    return []
  }

  return results.slice(0, 5).map((result) => ({
    title: typeof result?.title === "string" ? result.title : "",
    url: typeof result?.url === "string" ? result.url : "",
    content: typeof result?.content === "string" ? result.content : "",
  }))
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
      max_results: 5,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Web search failed")
  }

  return normalizeResults(data.results)
}

async function runWebFetch(url) {
  const response = await fetch("https://ollama.com/api/web_fetch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
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

  const loop = {
    goal,
    prompt,
    iterations: [],
    searches: [],
    fetches: [],
    findings: [],
    sources: [],
  }

  try {
    let nextAction = await askResearchModel({
      goal,
      prompt,
      loop,
      instruction: "Choose the first research step.",
    })

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
      const parsedAction = JSON.parse(cleanJsonResponse(nextAction))

      if (parsedAction.type === "search" && typeof parsedAction.query === "string") {
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

        nextAction = await askResearchModel({
          goal,
          prompt,
          loop,
          instruction: "Use the search results and decide whether to fetch a source or finish.",
        })
        continue
      }

      if (parsedAction.type === "fetch" && typeof parsedAction.url === "string") {
        const fetched = await runWebFetch(parsedAction.url)
        loop.iterations.push({
          type: "fetch",
          url: parsedAction.url,
          reason: typeof parsedAction.reason === "string" ? parsedAction.reason : "",
        })
        loop.fetches.push(fetched)

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

          nextAction = await askResearchModel({
            goal,
            prompt,
            loop,
            instruction: "You must continue researching. Return a search or fetch action, not a final answer yet.",
          })

          continue
        }

        return res.status(200).json({
          goal,
          prompt,
          loop,
          message: typeof parsedAction.message === "string" ? parsedAction.message : "Research complete.",
          findings: Array.isArray(parsedAction.findings) ? parsedAction.findings.filter((item) => typeof item === "string") : [],
          sources: Array.isArray(parsedAction.sources)
            ? parsedAction.sources.filter((item) => item && typeof item === "object")
            : loop.sources,
          done: true,
        })
      }

      break
    }

    const finalAnswer = await askResearchModel({
      goal,
      prompt,
      loop,
      instruction: "Summarize the research so far in final form. You may only finish now.",
    })

    const parsedFinal = JSON.parse(cleanJsonResponse(finalAnswer))

    return res.status(200).json({
      goal,
      prompt,
      loop,
      message: typeof parsedFinal.message === "string" ? parsedFinal.message : "Research complete.",
      findings: Array.isArray(parsedFinal.findings) ? parsedFinal.findings.filter((item) => typeof item === "string") : [],
      sources: Array.isArray(parsedFinal.sources)
        ? parsedFinal.sources.filter((item) => item && typeof item === "object")
        : loop.sources,
      done: true,
    })
  } catch (error) {
    console.error("Research engine failed:", error)

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Research engine failed",
    })
  }
})
