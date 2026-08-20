import { githubRouter } from "../github-router.js"

// Route for searching GitHub profiles and repositories
githubRouter.get("/:username", async (req, res) => {
  try {
    const { username } = req.params

    const profileResponse = await fetch(`https://api.github.com/users/${username}`)

    if (!profileResponse.ok) {
      return res.status(profileResponse.status).json({
        error: "Github user not found",
      })
    }

    const profile = await profileResponse.json()

    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`
    )

    if (!reposResponse.ok) {
      return res.status(reposResponse.status).json({
        error: "Unable to load GitHub repos",
      })
    }

    const repos = await reposResponse.json()

    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=6`
    )

    if (!eventsResponse.ok) {
      return res.status(eventsResponse.status).json({
        error: "Unable to load GitHub activity",
      })
    }

    const events = await eventsResponse.json()

    const ratingResponse = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
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
          {
            role: "system",
            content:
              "You rate GitHub profiles. Return only JSON with keys: score (number 0-100), summary (string), strengths (array of 3 strings), improvements (array of 3 strings). Be concise and fair.",
          },
          {
            role: "user",
            content: JSON.stringify({
              profile: {
                username: profile.login,
                name: profile.name,
                bio: profile.bio,
                followers: profile.followers,
                following: profile.following,
                publicRepos: profile.public_repos,
              },
              repos: repos.slice(0, 6).map((repo) => ({
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                updatedAt: repo.updated_at,
              })),
              activity: events.slice(0, 6).map((event) => ({
                type: event.type,
                repo: event.repo?.name,
              })),
            }),
          },
        ],
      }),
    })

    const ratingData = await ratingResponse.json()

    if (!ratingResponse.ok) {
      throw new Error(ratingData.error || "Unable to rate GitHub profile")
    }

    let rating = null

    try {
      rating = JSON.parse(
        ratingData.message?.content?.replace(/```json|```/g, "").trim() || "null"
      )
    } catch {
      rating = {
        score: 0,
        summary: "Unable to parse the rating response.",
        strengths: [],
        improvements: [],
      }
    }

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
      repos: repos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
      })),
      activity: events.map((event) => ({
        id: event.id,
        type: event.type,
        repo: event.repo.name,
        createdAt: event.created_at,
      })),
      rating,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to rate GitHub profile",
    })
  }
})
