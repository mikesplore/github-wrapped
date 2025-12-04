/**
 * Client-side GitHub API wrapper that uses custom tokens from localStorage
 */

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  size: number;
  private: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  repository?: {
    name: string;
  };
}

export interface GitHubPR {
  title: string;
  state: string;
  created_at: string;
  merged_at: string | null;
  repository?: {
    name: string;
  };
}

export interface GitHubIssue {
  title: string;
  state: string;
  created_at: string;
  closed_at: string | null;
  repository?: {
    name: string;
  };
}

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public rateLimitReset?: number
  ) {
    super(message);
    this.name = "GitHubAPIError";
  }
}

export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function fetchGitHub(
  url: string,
  token?: string
): Promise<Response> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const resetTime = response.headers.get("x-ratelimit-reset");
    const rateLimitReset = resetTime ? parseInt(resetTime) * 1000 : undefined;

    if (response.status === 403 || response.status === 429) {
      const resetDate = rateLimitReset
        ? new Date(rateLimitReset).toLocaleString()
        : "unknown";
      throw new GitHubAPIError(
        `GitHub API rate limit exceeded. Resets at ${resetDate}. Try providing your own GitHub token in settings.`,
        response.status,
        rateLimitReset
      );
    }

    throw new GitHubAPIError(
      `GitHub API error: ${response.statusText}`,
      response.status
    );
  }

  return response;
}

export async function getUserInfo(
  username: string,
  token?: string
): Promise<GitHubUser> {
  const response = await fetchGitHub(
    `https://api.github.com/users/${username}`,
    token
  );
  return response.json();
}

export async function getUserRepositories(
  username: string,
  year: number,
  token?: string
): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  // Determine visibility based on whether we have a token
  const visibility = token ? "all" : "public";
  
  while (true) {
    const url = token
      ? `https://api.github.com/user/repos?visibility=${visibility}&per_page=${perPage}&page=${page}`
      : `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;

    const response = await fetchGitHub(url, token);
    const repos: GitHubRepo[] = await response.json();

    if (repos.length === 0) break;

    // Filter repos updated in the specified year
    const filteredRepos = repos.filter((repo) => {
      const updatedYear = new Date(repo.updated_at).getFullYear();
      return updatedYear === year;
    });

    allRepos.push(...filteredRepos);

    if (repos.length < perPage) break;
    page++;
  }

  return allRepos;
}

export async function getUserCommits(
  username: string,
  year: number,
  token?: string
): Promise<GitHubCommit[]> {
  const startDate = `${year}-01-01T00:00:00Z`;
  const endDate = `${year}-12-31T23:59:59Z`;

  const searchQuery = `author:${username} committer-date:${year}-01-01..${year}-12-31`;
  const url = `https://api.github.com/search/commits?q=${encodeURIComponent(
    searchQuery
  )}&per_page=100&sort=committer-date`;

  try {
    const response = await fetchGitHub(url, token);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching commits:", error);
    return [];
  }
}

export async function getUserPullRequests(
  username: string,
  year: number,
  token?: string
): Promise<GitHubPR[]> {
  const searchQuery = `author:${username} created:${year}-01-01..${year}-12-31 type:pr`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
    searchQuery
  )}&per_page=100`;

  try {
    const response = await fetchGitHub(url, token);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    return [];
  }
}

export async function getUserIssues(
  username: string,
  year: number,
  token?: string
): Promise<GitHubIssue[]> {
  const searchQuery = `author:${username} created:${year}-01-01..${year}-12-31 type:issue`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
    searchQuery
  )}&per_page=100`;

  try {
    const response = await fetchGitHub(url, token);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
}
