import { githubRouter } from "../github-router.js"

// Route for searching GitHub profiles and repositories
githubRouter.get("/:username", async (req, res) => {
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
  })
})
