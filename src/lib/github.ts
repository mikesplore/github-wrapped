
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
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github+json",
    },
    // Cache for 1 hour to manage rate limits during development/repeated requests
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: "Unknown error" }));
    console.error("GitHub API Error:", errorBody.message);
    let message = `GitHub API request failed for ${endpoint}: ${errorBody.message}`;
    if (res.status === 401) {
      message = "GitHub token is invalid or has expired. Please provide a valid one.";
    } else if (res.status === 403) {
        message = "GitHub API rate limit exceeded. Please wait a while before trying again."
    }
    throw new Error(message);
  }

  return res.json();
}

// Helper to fetch all pages of a paginated endpoint
async function fetchAllPages(endpoint: string, maxPages: number = 5): Promise<any[]> {
  const results: any[] = [];
  let page = 1;
  
  while (page <= maxPages) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const data = await githubFetch(`${endpoint}${separator}per_page=100&page=${page}`);
    
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    
    if (data.length < 100) break; // No more pages
    page++;
  }
  
  return results;
}

export async function getGithubData(username: string, year: number) {
  const dateRange = `${year}-01-01T00:00:00Z..${year}-12-31T23:59:59Z`;
  const queryDateRange = `${year}-01-01..${year}-12-31`;

  try {
    // Fetch user info first
    const user = await githubFetch(`/users/${username}`);

    // Fetch all repos (public + private) using affiliation parameter
    const allRepos = await fetchAllPages(`/user/repos?affiliation=owner,collaborator&sort=updated`, 10);
    
    // Filter repos for this user
    const userRepos = allRepos.filter((repo: any) => repo.owner.login === username);
    
    // Separate public and private repos
    const publicRepos = userRepos.filter((repo: any) => !repo.private);
    const privateRepos = userRepos.filter((repo: any) => repo.private);

    // Parallel fetch for search queries and other data
    const [
      prResponse,
      issueResponse,
      starredRepos,
      followersData,
      followingData,
    ] = await Promise.all([
      githubFetch(
        `/search/issues?q=author:${username}+is:pr+created:${queryDateRange}&per_page=1`
      ),
      githubFetch(
        `/search/issues?q=author:${username}+is:issue+created:${queryDateRange}&per_page=1`
      ),
      fetchAllPages(`/users/${username}/starred`, 3),
      fetchAllPages(`/users/${username}/followers`, 5),
      fetchAllPages(`/users/${username}/following`, 5),
    ]);

    // Get accurate commit count by fetching from each repo
    // This is faster and more accurate than search API
    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year}-12-31T23:59:59Z`);
    
    let totalCommits = 0;
    const repoCommitData: Array<{ repo: string; commits: number; language: string | null }> = [];
    
    const commitPromises = userRepos.slice(0, 50).map(async (repo: any) => {
      try {
        const commits = await githubFetch(
          `/repos/${repo.full_name}/commits?author=${username}&since=${startDate.toISOString()}&until=${endDate.toISOString()}&per_page=1`
        );
        const count = Array.isArray(commits) ? commits.length : 0;
        repoCommitData.push({
          repo: repo.name,
          commits: count,
          language: repo.language,
        });
        return count;
      } catch {
        return 0;
      }
    });

    const commitCounts = await Promise.all(commitPromises);
    totalCommits = commitCounts.reduce((sum, count) => sum + count, 0);

    // For repos beyond first 50, use statistics API for efficiency
    if (userRepos.length > 50) {
      const remainingRepos = userRepos.slice(50);
      const statsPromises = remainingRepos.map(async (repo: any) => {
        try {
          const stats = await githubFetch(`/repos/${repo.full_name}/stats/contributors`);
          if (Array.isArray(stats)) {
            const userStats = stats.find((s: any) => s.author?.login === username);
            if (userStats?.weeks) {
              // Sum commits from weeks in the target year
              const yearCommits = userStats.weeks
                .filter((week: any) => {
                  const weekDate = new Date(week.w * 1000);
                  return weekDate >= startDate && weekDate <= endDate;
                })
                .reduce((sum: number, week: any) => sum + (week.c || 0), 0);
              repoCommitData.push({
                repo: repo.name,
                commits: yearCommits,
                language: repo.language,
              });
              return yearCommits;
            }
          }
          return 0;
        } catch {
          return 0;
        }
      });
      
      const additionalCommits = await Promise.all(statsPromises);
      totalCommits += additionalCommits.reduce((sum, count) => sum + count, 0);
    }

    // Find repo with most commits
    const topRepoByCommits = repoCommitData
      .filter(r => r.commits > 0)
      .sort((a, b) => b.commits - a.commits)[0] || null;

    // Fetch language data from repos (increased sample)
    const repoSample = userRepos.slice(0, 100);
    const languagePromises = repoSample.map((repo: any) =>
      githubFetch(`/repos/${repo.full_name}/languages`).catch(() => ({}))
    );
    const languagesData = await Promise.all(languagePromises);

    const languageMap: Record<string, number> = {};
    languagesData.forEach((langData) => {
      for (const lang in langData) {
        languageMap[lang] = (languageMap[lang] || 0) + langData[lang];
      }
    });
    
    const sortedLanguages = Object.entries(languageMap).sort(([, a], [, b]) => b - a);

    // Get top repos by different metrics
    const topReposByStars = [...userRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        stars: r.stargazers_count,
        description: r.description,
        language: r.language,
        url: r.html_url,
      }));

    const topReposByForks = [...userRepos]
      .sort((a, b) => b.forks_count - a.forks_count)
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        forks: r.forks_count,
        language: r.language,
      }));

    // Recently updated repos in the selected year
    const recentlyUpdated = userRepos
      .filter((repo: any) => {
        const updated = new Date(repo.updated_at);
        return updated.getFullYear() === year;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        updated_at: r.updated_at,
        language: r.language,
      }));

    // Repo graveyard (abandoned repos)
    const repoGraveyard = userRepos
      .filter((repo: any) => {
        const lastPushed = new Date(repo.pushed_at);
        return lastPushed.getFullYear() < year && !repo.fork;
      })
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        pushed_at: r.pushed_at,
        language: r.language,
      }));

    // Forked repos count
    const forkedRepos = userRepos.filter((repo: any) => repo.fork);

    // Calculate total stars received across all repos
    const totalStarsReceived = userRepos.reduce(
      (sum: number, repo: any) => sum + repo.stargazers_count,
      0
    );

    // Calculate total forks received across all repos
    const totalForksReceived = userRepos.reduce(
      (sum: number, repo: any) => sum + repo.forks_count,
      0
    );

    // Activity metrics
    const activityHistory = {
      totalCommits,
      totalPRs: prResponse.total_count,
      totalIssues: issueResponse.total_count,
      publicRepos: publicRepos.length,
      privateRepos: privateRepos.length,
      totalRepos: userRepos.length,
      forkedRepos: forkedRepos.length,
      totalStarsReceived,
      totalForksReceived,
      totalStarsGiven: starredRepos.length,
    };

    return {
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
        bio: user.bio,
        followers: followersData.length,
        following: followingData.length,
        public_repos: user.public_repos,
        created_at: user.created_at,
      },
      stats: {
        commits: totalCommits,
        pullRequests: prResponse.total_count,
        issues: issueResponse.total_count,
        repos: userRepos.length,
        publicRepos: publicRepos.length,
        privateRepos: privateRepos.length,
        forkedRepos: forkedRepos.length,
        starred: starredRepos.length,
        totalStarsReceived,
        totalForksReceived,
        followers: followersData.length,
        following: followingData.length,
      },
      languages: sortedLanguages,
      topReposByStars,
      topReposByForks,
      topRepoByCommits,
      recentlyUpdated,
      repoGraveyard,
      starredSample: starredRepos.slice(0, 10).map((r: any) => ({
        full_name: r.full_name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
      })),
      activityHistory,
      socialStats: {
        followers: followersData.length,
        following: followingData.length,
        followRatio: followingData.length > 0 
          ? (followersData.length / followingData.length).toFixed(2)
          : followersData.length,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
        console.error(`Failed to get GitHub data for ${username}:`, error.message);
        if (error.message.includes("Not Found")) {
            throw new Error(`User '${username}' not found on GitHub.`);
        }
    }
    throw error;
  }
}
