const GITHUB_API = 'https://api.github.com'

export async function getGitHubUser(token: string) {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!res.ok) throw new Error('Failed to fetch GitHub user')
  return res.json()
}


export async function getGitHubRepos(token: string) {
  const res = await fetch(
    `${GITHUB_API}/user/repos?sort=pushed&per_page=50&type=owner`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!res.ok) throw new Error('Failed to fetch GitHub repos')
  return res.json()
}

export async function getRepoCommits(
  token: string,
  owner: string,
  repo: string
) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!res.ok) return []
  return res.json()
}

export async function getCommitActivity(token: string, username: string) {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const res = await fetch(
    `${GITHUB_API}/search/commits?q=author:${username}+author-date:>${since.toISOString().split('T')[0]}&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!res.ok) return { items: [] }
  return res.json()
}