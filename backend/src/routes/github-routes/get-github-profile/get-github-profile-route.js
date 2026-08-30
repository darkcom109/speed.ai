import { githubRouter } from "../github-router.js"

const GITHUB_API = "https://api.github.com"

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(Math.round(value), minimum), maximum)
}

function getGrade(score) {
  if (score >= 90) return "A+"
  if (score >= 80) return "A"
  if (score >= 70) return "B"
  if (score >= 60) return "C"
  if (score >= 50) return "D"
  return "E"
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "speed.ai",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  return headers
}

async function fetchGithub(path) {
  return fetch(`${GITHUB_API}${path}`, { headers: githubHeaders() })
}

function buildEvaluation(profile, repos, events, readmeRepoIds) {
  const originalRepos = repos.filter((repo) => !repo.fork)
  const describedRepos = originalRepos.filter((repo) => repo.description?.trim())
  const languages = new Set(originalRepos.map((repo) => repo.language).filter(Boolean))
  const totalStars = originalRepos.reduce((total, repo) => total + repo.stargazers_count, 0)
  const totalForks = originalRepos.reduce((total, repo) => total + repo.forks_count, 0)
  const recentEvents = events.filter((event) => {
    const age = Date.now() - new Date(event.created_at).getTime()
    return age <= 90 * 24 * 60 * 60 * 1000
  })
  const activeRepos = new Set(recentEvents.map((event) => event.repo?.name).filter(Boolean))
  const pushEvents = recentEvents.filter((event) => event.type === "PushEvent")
  const latestActivityAt = recentEvents[0]?.created_at || null
  const latestActivityDays = latestActivityAt
    ? Math.floor((Date.now() - new Date(latestActivityAt).getTime()) / (24 * 60 * 60 * 1000))
    : null
  const readmeSampleSize = Math.min(originalRepos.length, 6)
  const readmeCoverage = readmeSampleSize ? readmeRepoIds.size / readmeSampleSize : 0
  const descriptionCoverage = originalRepos.length
    ? describedRepos.length / originalRepos.length
    : 0

  const profileScore = clamp(
    (profile.name ? 2 : 0) +
      (profile.bio ? 4 : 0) +
      (profile.location ? 2 : 0) +
      (profile.blog ? 2 : 0) +
      (profile.company ? 1 : 0) +
      Math.min(profile.public_repos / 5, 1) * 4,
    0,
    15
  )
  const portfolioScore = clamp(
    Math.min(originalRepos.length / 10, 1) * 8 +
      descriptionCoverage * 6 +
      (repos.length ? originalRepos.length / repos.length : 0) * 4 +
      Math.min(languages.size / 4, 1) * 4 +
      Math.min((totalStars + totalForks * 2) / 10, 1) * 3,
    0,
    25
  )
  const documentationScore = clamp(readmeCoverage * 14 + descriptionCoverage * 6, 0, 20)
  const activityScore = clamp(
    Math.min(recentEvents.length / 20, 1) * 10 +
      Math.min(activeRepos.size / 5, 1) * 5 +
      (latestActivityDays === null
        ? 0
        : latestActivityDays <= 7
          ? 5
          : latestActivityDays <= 30
            ? 3
            : 1) +
      Math.min(pushEvents.length / 5, 1) * 5,
    0,
    25
  )
  const impactScore = clamp(
    Math.min(totalStars / 10, 1) * 6 +
      Math.min(totalForks / 5, 1) * 4 +
      Math.min(profile.followers / 20, 1) * 5,
    0,
    15
  )

  const categories = [
    {
      key: "profile",
      label: "Profile",
      score: profileScore,
      maxScore: 15,
      evidence: profile.bio
        ? "Bio and core identity details are present."
        : "A clear bio and more profile details would improve first impressions.",
    },
    {
      key: "portfolio",
      label: "Portfolio",
      score: portfolioScore,
      maxScore: 25,
      evidence: `${originalRepos.length} original repositories across ${languages.size} detected languages; ${Math.round(descriptionCoverage * 100)}% include descriptions.`,
    },
    {
      key: "documentation",
      label: "Documentation",
      score: documentationScore,
      maxScore: 20,
      evidence: `${readmeRepoIds.size} of ${readmeSampleSize} sampled repositories have a README.`,
    },
    {
      key: "activity",
      label: "Activity",
      score: activityScore,
      maxScore: 25,
      evidence: `${recentEvents.length} public events across ${activeRepos.size} repositories in the last 90 days.`,
    },
    {
      key: "impact",
      label: "Impact",
      score: impactScore,
      maxScore: 15,
      evidence: `${totalStars} stars, ${totalForks} forks, and ${profile.followers} followers across the reviewed portfolio.`,
    },
  ]
  const score = categories.reduce((total, category) => total + category.score, 0)

  return {
    score,
    grade: getGrade(score),
    categories,
    metrics: {
      originalRepos: originalRepos.length,
      languages: languages.size,
      totalStars,
      totalForks,
      readmeCoverage: Math.round(readmeCoverage * 100),
      descriptionCoverage: Math.round(descriptionCoverage * 100),
      recentEvents: recentEvents.length,
      activeRepos: activeRepos.size,
      latestActivityAt,
    },
  }
}

function fallbackNarrative(evaluation) {
  const ranked = [...evaluation.categories].sort(
    (a, b) => b.score / b.maxScore - a.score / a.maxScore
  )

  return {
    summary: `This profile earns ${evaluation.score}/100 (${evaluation.grade}). Its strongest area is ${ranked[0].label.toLowerCase()}, while ${ranked.at(-1).label.toLowerCase()} offers the clearest opportunity to improve.`,
    strengths: ranked.slice(0, 3).map((category) => category.evidence),
    improvements: ranked
      .slice(-3)
      .reverse()
      .map((category) => `Improve ${category.label.toLowerCase()}: ${category.evidence}`),
  }
}

async function generateNarrative(profile, repos, evaluation) {
  const fallback = fallbackNarrative(evaluation)
  const ratingResponse = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      stream: false,
      think: false,
      format: "json",
      messages: [
        {
          role: "system",
          content:
            "Explain an evidence-based GitHub evaluation. Numeric scores are fixed. Return only JSON with summary (2 concise sentences), strengths (3 specific strings), and improvements (3 specific actionable strings). Mention only supplied evidence.",
        },
        {
          role: "user",
          content: JSON.stringify({
            profile: {
              username: profile.login,
              bio: profile.bio,
              followers: profile.followers,
              publicRepos: profile.public_repos,
            },
            evaluation,
            reviewedRepositories: repos.slice(0, 10).map((repo) => ({
              name: repo.name,
              description: repo.description,
              language: repo.language,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
            })),
          }),
        },
      ],
    }),
  })

  if (!ratingResponse.ok) return fallback

  try {
    const ratingData = await ratingResponse.json()
    const parsed = JSON.parse(
      ratingData.message?.content?.replace(/```json|```/g, "").trim() || "null"
    )

    return {
      summary: typeof parsed?.summary === "string" ? parsed.summary : fallback.summary,
      strengths: Array.isArray(parsed?.strengths)
        ? parsed.strengths.filter((item) => typeof item === "string").slice(0, 3)
        : fallback.strengths,
      improvements: Array.isArray(parsed?.improvements)
        ? parsed.improvements.filter((item) => typeof item === "string").slice(0, 3)
        : fallback.improvements,
    }
  } catch {
    return fallback
  }
}

githubRouter.get("/:username", async (req, res) => {
  try {
    const username = req.params.username.trim()
    const [profileResponse, reposResponse, eventsResponse] = await Promise.all([
      fetchGithub(`/users/${encodeURIComponent(username)}`),
      fetchGithub(`/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`),
      fetchGithub(`/users/${encodeURIComponent(username)}/events/public?per_page=100`),
    ])

    if (!profileResponse.ok) {
      return res.status(profileResponse.status).json({ error: "GitHub user not found" })
    }
    if (!reposResponse.ok || !eventsResponse.ok) {
      return res.status(502).json({ error: "Unable to load complete GitHub profile data" })
    }

    const [profile, allRepos, events] = await Promise.all([
      profileResponse.json(),
      reposResponse.json(),
      eventsResponse.json(),
    ])
    const repos = allRepos.filter((repo) => !repo.archived)
    const readmeSample = repos.filter((repo) => !repo.fork).slice(0, 6)
    const readmeChecks = await Promise.all(
      readmeSample.map(async (repo) => ({
        id: repo.id,
        exists: (
          await fetchGithub(`/repos/${profile.login}/${encodeURIComponent(repo.name)}/readme`)
        ).ok,
      }))
    )
    const readmeRepoIds = new Set(
      readmeChecks.filter((check) => check.exists).map((check) => check.id)
    )
    const evaluation = buildEvaluation(profile, repos, events, readmeRepoIds)
    const narrative = await generateNarrative(profile, repos, evaluation)

    return res.json({
      profile: {
        username: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        profileUrl: profile.html_url,
      },
      repos: repos.slice(0, 12).map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
        hasReadme: readmeRepoIds.has(repo.id),
      })),
      activity: events.slice(0, 20).map((event) => ({
        id: event.id,
        type: event.type,
        repo: event.repo?.name || "Unknown repository",
        createdAt: event.created_at,
      })),
      rating: {
        ...evaluation,
        ...narrative,
        evaluatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to rate GitHub profile",
    })
  }
})
