
const GITHUB_API_URL = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function githubFetch(
  endpoint: string,
  token?: string,
  options: RequestInit = {}
): Promise<any> {
  const authToken = token || GITHUB_TOKEN;
  
  if (!authToken) {
    throw new Error(
      "No GitHub token available. Please login or set GITHUB_TOKEN."
    );
  }

  const res = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `token ${authToken}`,
      Accept: "application/vnd.github+json",
    },
    cache: 'no-store', // Disable caching for fresh data
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: "Unknown error" }));
    console.error("GitHub API Error:", errorBody.message);
    let message = `GitHub API request failed for ${endpoint}: ${errorBody.message}`;
    if (res.status === 401) {
      message = "GitHub token is invalid or has expired. Please login again.";
    } else if (res.status === 403) {
        message = "GitHub API rate limit exceeded. Please wait a while before trying again."
    }
    throw new Error(message);
  }

  return res.json();
}

// Helper to fetch all pages
async function fetchAllPages(endpoint: string, token?: string, maxPages: number = 10): Promise<any[]> {
  const results: any[] = [];
  let page = 1;
  
  while (page <= maxPages) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const data = await githubFetch(`${endpoint}${separator}per_page=100&page=${page}`, token);
    
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    
    if (data.length < 100) break;
    page++;
  }
  
  return results;
}

export async function getGithubData(username: string, year: number, userToken?: string) {
  const queryDateRange = `${year}-01-01..${year}-12-31`;

  try {
    // Fetch authenticated user info first
    const authenticatedUser = await githubFetch(`/user`, userToken);
    
    // Check if requesting authenticated user's data or another user
    const isAuthenticatedUser = authenticatedUser.login.toLowerCase() === username.toLowerCase();
    
    // Fetch user info
    const user = isAuthenticatedUser ? authenticatedUser : await githubFetch(`/users/${username}`, userToken);

    // Fetch ALL repos (public + private) using visibility=all for authenticated user
    console.log("Fetching all repos (public + private)...");
    const allRepos = isAuthenticatedUser 
      ? await fetchAllPages(`/user/repos?visibility=all&affiliation=owner`, userToken, 10)
      : await fetchAllPages(`/users/${username}/repos?type=all`, userToken, 10);
    
    console.log(`Total repos fetched: ${allRepos.length}`);
    
    // Separate public and private
    const publicRepos = allRepos.filter((repo: any) => !repo.private);
    const privateRepos = allRepos.filter((repo: any) => repo.private);
    
    console.log(`Public: ${publicRepos.length}, Private: ${privateRepos.length}`);

    // Parallel fetch for other data
    const [
      prResponse,
      issueResponse,
      starredRepos,
      followersData,
      followingData,
    ] = await Promise.all([
      githubFetch(
        `/search/issues?q=author:${username}+is:pr+created:${queryDateRange}&per_page=1`,
        userToken
      ).catch(() => ({ total_count: 0 })),
      githubFetch(
        `/search/issues?q=author:${username}+is:issue+created:${queryDateRange}&per_page=1`,
        userToken
      ).catch(() => ({ total_count: 0 })),
      fetchAllPages(`/users/${username}/starred`, userToken, 3),
      fetchAllPages(`/users/${username}/followers`, userToken, 5),
      fetchAllPages(`/users/${username}/following`, userToken, 5),
    ]);

    // Calculate total stars and forks
    const totalStarsReceived = allRepos.reduce(
      (sum: number, repo: any) => sum + repo.stargazers_count,
      0
    );
    const totalForksReceived = allRepos.reduce(
      (sum: number, repo: any) => sum + repo.forks_count,
      0
    );

    // Get commit counts per repo using contributors endpoint (like Python example)
    console.log("Fetching commit counts...");
    const repoCommitData: Array<{ repo: string; commits: number; language: string | null }> = [];
    let totalCommits = 0;
    const allCommitDates: Date[] = [];

    // Process repos in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < allRepos.length; i += batchSize) {
      const batch = allRepos.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (repo: any) => {
        try {
          // Use contributors endpoint for accurate commit count
          const contributors = await githubFetch(`/repos/${repo.full_name}/contributors`, userToken);
          
          if (Array.isArray(contributors)) {
            const userContrib = contributors.find((c: any) => c.login === username);
            const commitCount = userContrib?.contributions || 0;
            
            repoCommitData.push({
              repo: repo.name,
              commits: commitCount,
              language: repo.language,
            });
            
            totalCommits += commitCount;

            // Fetch commit dates for streak calculation (limit to 100 per repo)
            if (commitCount > 0) {
              const commits = await githubFetch(
                `/repos/${repo.full_name}/commits?author=${username}&per_page=100`,
                userToken
              ).catch(() => []);
              
              if (Array.isArray(commits)) {
                commits.forEach((commit: any) => {
                  const dateStr = commit.commit?.author?.date;
                  if (dateStr) {
                    allCommitDates.push(new Date(dateStr));
                  }
                });
              }
            }
          }
        } catch (error) {
          console.log(`Skipping ${repo.name}:`, error);
        }
      }));
    }

    console.log(`Total commits calculated: ${totalCommits}`);

    // Find repo with most commits
    const topRepoByCommits = repoCommitData
      .filter(r => r.commits > 0)
      .sort((a, b) => b.commits - a.commits)[0] || null;

    // Calculate longest commit streak
    let longestStreak = 0;
    if (allCommitDates.length > 0) {
      const sortedDates = allCommitDates
        .map(d => d.toISOString().split('T')[0]) // Get just the date part
        .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
        .sort();

      let currentStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
    }

    // Fetch language data
    const languageMap: Record<string, number> = {};
    
    const langBatchSize = 20;
    for (let i = 0; i < allRepos.length; i += langBatchSize) {
      const batch = allRepos.slice(i, i + langBatchSize);
      
      await Promise.all(batch.map(async (repo: any) => {
        try {
          const langData = await githubFetch(`/repos/${repo.full_name}/languages`, userToken);
          for (const lang in langData) {
            languageMap[lang] = (languageMap[lang] || 0) + langData[lang];
          }
        } catch {
          // Skip if language fetch fails
        }
      }));
    }
    
    const sortedLanguages = Object.entries(languageMap).sort(([, a], [, b]) => b - a);

    // Get top repos by different metrics
    const topReposByStars = [...allRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        stars: r.stargazers_count,
        description: r.description,
        language: r.language,
        url: r.html_url,
      }));

    const topReposByForks = [...allRepos]
      .sort((a, b) => b.forks_count - a.forks_count)
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        forks: r.forks_count,
        language: r.language,
      }));

    // Recently updated repos in the selected year
    const recentlyUpdated = allRepos
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
    const repoGraveyard = allRepos
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

    // Forked repos
    const forkedRepos = allRepos.filter((repo: any) => repo.fork);

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
        repos: allRepos.length,
        publicRepos: publicRepos.length,
        privateRepos: privateRepos.length,
        forkedRepos: forkedRepos.length,
        starred: starredRepos.length,
        totalStarsReceived,
        totalForksReceived,
        followers: followersData.length,
        following: followingData.length,
        longestStreak,
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
      activityHistory: {
        totalCommits,
        totalPRs: prResponse.total_count,
        totalIssues: issueResponse.total_count,
        publicRepos: publicRepos.length,
        privateRepos: privateRepos.length,
        totalRepos: allRepos.length,
        forkedRepos: forkedRepos.length,
        totalStarsReceived,
        totalForksReceived,
        totalStarsGiven: starredRepos.length,
        longestStreak,
      },
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
