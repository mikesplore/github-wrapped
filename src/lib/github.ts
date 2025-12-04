
const GITHUB_API_URL = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function githubFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "GITHUB_TOKEN is not set. Please add it to your environment variables."
    );
  }

  const res = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `token ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github+json",
    },
    // Cache for 1 hour to manage rate limits during development/repeated requests
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const errorBody = await res.json();
    console.error("GitHub API Error:", errorBody.message);
    let message = `GitHub API request failed for ${endpoint}: ${errorBody.message}`;
    if (res.status === 401) {
      message = "GitHub token is invalid or has expired. Please provide a valid one.";
    } else if (res.status === 403) {
        message = "GitHub API rate limit exceeded. Please wait a while before trying again."
    }
    throw new Error(
      message
    );
  }

  return res.json();
}

export async function getGithubData(username: string, year: number) {
  const dateRange = `${year}-01-01T00:00:00Z..${year}-12-31T23:59:59Z`;
  const queryDateRange = `${year}-01-01..${year}-12-31`;

  try {
    const user = await githubFetch(`/users/${username}`);

    // Fetch all repos including private ones with affiliation parameter
    const [
      commitResponse,
      publicRepos,
      privateRepos,
      prResponse,
      issueResponse,
      starredResponse,
    ] = await Promise.all([
      githubFetch(
        `/search/commits?q=author:${username}+author-date:${queryDateRange}&per_page=1`
      ),
      githubFetch(`/users/${username}/repos?per_page=100&sort=pushed&type=public`),
      // Fetch private repos using authenticated endpoint
      githubFetch(`/user/repos?per_page=100&sort=pushed&type=private&affiliation=owner,collaborator,organization_member`).catch(() => []),
      githubFetch(
        `/search/issues?q=author:${username}+is:pr+created:${queryDateRange}&per_page=1`
      ),
      githubFetch(
        `/search/issues?q=author:${username}+is:issue+created:${queryDateRange}&per_page=1`
      ),
      githubFetch(`/users/${username}/starred?per_page=100`),
    ]);

    // Combine public and private repos, filtering private repos to only include the target user's
    const allPrivateRepos = Array.isArray(privateRepos) 
      ? privateRepos.filter((repo: any) => repo.owner.login === username)
      : [];
    const repoResponse = [...publicRepos, ...allPrivateRepos];

    // Fetch language data from more repos for better accuracy
    const languagePromises = repoResponse
      .slice(0, 50) // Increased from 20 to 50 for better accuracy
      .map((repo: any) =>
        githubFetch(repo.languages_url.replace(GITHUB_API_URL, "")).catch(() => ({}))
      );
    const languagesData = await Promise.all(languagePromises);

    const languageMap: Record<string, number> = {};
    languagesData.forEach((langData) => {
      for (const lang in langData) {
        languageMap[lang] = (languageMap[lang] || 0) + langData[lang];
      }
    });
    
    const sortedLanguages = Object.entries(languageMap).sort(([, a], [, b]) => b - a);
    
    // Enhanced activity history with more metrics
    const activityHistory = {
        totalCommits: commitResponse.total_count,
        totalPRs: prResponse.total_count,
        totalIssues: issueResponse.total_count,
        reposContributedTo: new Set(commitResponse.items?.map((c: any) => c.repository.full_name)).size,
        publicRepos: publicRepos.length,
        privateRepos: allPrivateRepos.length,
        totalRepos: repoResponse.length,
    };

    const repoGraveyard = repoResponse.filter((repo: any) => {
        const lastPushed = new Date(repo.pushed_at);
        return repo.owner.login === username && lastPushed.getFullYear() < year && repo.fork === false;
    }).slice(0, 10); // Increased to 10 for more comprehensive data


    return {
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
      },
      stats: {
        commits: commitResponse.total_count,
        pullRequests: prResponse.total_count,
        issues: issueResponse.total_count,
        repos: repoResponse.length,
        starred: starredResponse.length,
      },
      languages: sortedLanguages.slice(0, 5),
      repoGraveyard: repoGraveyard.map((r: any) => ({ name: r.name, pushed_at: r.pushed_at })),
      starredSample: starredResponse.slice(0, 5).map((r: any) => r.full_name),
      activityHistory: activityHistory,
    };
  } catch (error) {
    if (error instanceof Error) {
        console.error(`Failed to get GitHub data for ${username}:`, error.message);
        if (error.message.includes("Not Found")) {
            throw new Error(`User '${username}' not found on GitHub.`);
        }
    }
    throw error; // Re-throw the original error
  }
}
