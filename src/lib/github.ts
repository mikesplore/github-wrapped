
const GITHUB_API_URL = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
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
    console.error("GitHub API Error:", {
      status: res.status,
      endpoint,
      message: errorBody.message,
      remaining: res.headers.get('x-ratelimit-remaining'),
      reset: res.headers.get('x-ratelimit-reset')
    });
    
    let message = `GitHub API request failed for ${endpoint}: ${errorBody.message}`;
    
    if (res.status === 401) {
      message = "GitHub authentication failed. Please logout and login again to refresh your token.";
    } else if (res.status === 403) {
      const remaining = res.headers.get('x-ratelimit-remaining');
      const resetTime = res.headers.get('x-ratelimit-reset');
      
      if (remaining === '0') {
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
        const minutesUntilReset = resetDate 
          ? Math.ceil((resetDate.getTime() - Date.now()) / 60000)
          : 'unknown';
        
        message = `GitHub API rate limit exceeded. Your rate limit will reset in approximately ${minutesUntilReset} minutes. Try logging in with GitHub for higher limits (5,000 requests/hour vs 60 for guests).`;
      } else {
        message = "GitHub API access forbidden. This might be due to permissions or rate limiting.";
      }
    } else if (res.status === 404) {
      message = `User or resource not found. Please check the username and try again.`;
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

// GraphQL helper for contribution data
async function githubGraphQL(query: string, variables: any, token?: string): Promise<any> {
  const authToken = token || GITHUB_TOKEN;
  
  if (!authToken) {
    throw new Error("No GitHub token available for GraphQL.");
  }

  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.statusText}`);
  }

  const data = await res.json();
  
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

// Helper to parse date string safely without timezone issues
function parseDateString(dateStr: string): number {
  // Parse YYYY-MM-DD format without timezone conversion
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return 0; // Return 0 for invalid format
  }
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return 0; // Return 0 for invalid numbers
  }
  // Return a numeric representation for comparison (YYYYMMDD)
  return year * 10000 + month * 100 + day;
}

// Days in each month (non-leap year)
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Check if a year is a leap year
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Get days in a specific month
function getDaysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
}

// Helper to check if two dates are consecutive days using pure arithmetic
function areConsecutiveDays(date1: number, date2: number): boolean {
  // date1 and date2 are in YYYYMMDD format
  const y1 = Math.floor(date1 / 10000);
  const m1 = Math.floor((date1 % 10000) / 100);
  const d1 = date1 % 100;
  
  const y2 = Math.floor(date2 / 10000);
  const m2 = Math.floor((date2 % 10000) / 100);
  const d2 = date2 % 100;
  
  // Check if date2 is exactly one day after date1
  // Case 1: Same month - day increases by 1
  if (y1 === y2 && m1 === m2 && d2 === d1 + 1) {
    return true;
  }
  
  // Case 2: Next month - last day of month to first day of next month
  if (y1 === y2 && m2 === m1 + 1 && d2 === 1 && d1 === getDaysInMonth(y1, m1)) {
    return true;
  }
  
  // Case 3: Next year - Dec 31 to Jan 1
  if (y2 === y1 + 1 && m1 === 12 && m2 === 1 && d1 === 31 && d2 === 1) {
    return true;
  }
  
  return false;
}

// Calculate longest commit streak using GraphQL contribution calendar
async function calculateCommitStreak(username: string, year: number, token?: string): Promise<number> {
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    login: username,
    from: `${year}-01-01T00:00:00Z`,
    to: `${year}-12-31T23:59:59Z`,
  };

  try {
    const data = await githubGraphQL(query, variables, token);
    const weeks = data.user.contributionsCollection.contributionCalendar.weeks;

    // Extract dates with contributions
    const dates: string[] = [];
    for (const week of weeks) {
      for (const day of week.contributionDays) {
        if (day.contributionCount > 0) {
          dates.push(day.date);
        }
      }
    }

    if (dates.length === 0) return 0;

    // Convert to numeric format, filter out invalid dates, and sort
    const sortedDates = dates
      .map(d => parseDateString(d))
      .filter(d => d > 0) // Filter out invalid dates (returns 0)
      .sort((a, b) => a - b);

    if (sortedDates.length === 0) return 0;

    // Calculate longest streak
    let longest = 1;
    let current = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      if (areConsecutiveDays(sortedDates[i - 1], sortedDates[i])) {
        // Consecutive day
        current++;
      } else {
        // Streak broken, save the longest and reset
        longest = Math.max(longest, current);
        current = 1;
      }
    }

    // Don't forget to check the final streak
    longest = Math.max(longest, current);

    return longest;
  } catch (error) {
    console.error("Error calculating commit streak:", error);
    return 0; // Fallback if GraphQL fails
  }
}

// Get year-specific commit count using GraphQL
async function getYearCommitCount(username: string, year: number, token?: string): Promise<number> {
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          restrictedContributionsCount
        }
      }
    }
  `;

  const variables = {
    login: username,
    from: `${year}-01-01T00:00:00Z`,
    to: `${year}-12-31T23:59:59Z`,
  };

  try {
    const data = await githubGraphQL(query, variables, token);
    const collection = data.user.contributionsCollection;
    // Include both public commits and restricted (private repo) commits
    return collection.totalCommitContributions + collection.restrictedContributionsCount;
  } catch (error) {
    console.error("Error getting year commit count:", error);
    return 0;
  }
}

// Get total contributions for a year using GraphQL (includes all contribution types)
async function getTotalContributions(username: string, year: number, token?: string): Promise<number> {
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const variables = {
    login: username,
    from: `${year}-01-01T00:00:00Z`,
    to: `${year}-12-31T23:59:59Z`,
  };

  try {
    const data = await githubGraphQL(query, variables, token);
    return data.user.contributionsCollection.contributionCalendar.totalContributions;
  } catch (error) {
    console.error("Error getting total contributions:", error);
    return 0;
  }
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

    // Calculate total stars and forks (only from non-forked repos for accuracy)
    const nonForkedRepos = allRepos.filter((repo: any) => !repo.fork);
    const totalStarsReceived = nonForkedRepos.reduce(
      (sum: number, repo: any) => sum + repo.stargazers_count,
      0
    );
    const totalForksReceived = nonForkedRepos.reduce(
      (sum: number, repo: any) => sum + repo.forks_count,
      0
    );

    // Get year-specific commit count using GraphQL (most accurate)
    console.log("Fetching year-specific commit count...");
    const totalCommits = await getYearCommitCount(username, year, userToken);
    console.log(`Total commits for ${year}: ${totalCommits}`);

    // Get commit counts per repo (for "top repo by commits" feature)
    // Only include non-forked repos for this breakdown
    console.log("Fetching per-repo commit counts...");
    const repoCommitData: Array<{ repo: string; commits: number; language: string | null; isFork: boolean }> = [];

    // Process non-forked repos in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < nonForkedRepos.length; i += batchSize) {
      const batch = nonForkedRepos.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (repo: any) => {
        try {
          // Use contributors endpoint for per-repo commit count
          const contributors = await githubFetch(`/repos/${repo.full_name}/contributors`, userToken);
          
          if (Array.isArray(contributors)) {
            const userContrib = contributors.find((c: any) => c.login.toLowerCase() === username.toLowerCase());
            const commitCount = userContrib?.contributions || 0;
            
            repoCommitData.push({
              repo: repo.name,
              commits: commitCount,
              language: repo.language,
              isFork: repo.fork,
            });
          }
        } catch (error) {
          console.log(`Skipping ${repo.name}:`, error);
        }
      }));
    }

    // Find repo with most commits (excluding forks for accuracy)
    const topRepoByCommits = repoCommitData
      .filter(r => r.commits > 0 && !r.isFork)
      .sort((a, b) => b.commits - a.commits)[0] || null;

    // Calculate longest commit streak using GraphQL (more accurate)
    console.log("Calculating commit streak with GraphQL...");
    const longestStreak = await calculateCommitStreak(username, year, userToken);

    // Fetch language data (only from non-forked repos for accuracy)
    const languageMap: Record<string, number> = {};
    
    const langBatchSize = 20;
    for (let i = 0; i < nonForkedRepos.length; i += langBatchSize) {
      const batch = nonForkedRepos.slice(i, i + langBatchSize);
      
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
    
    // Calculate total bytes for percentage conversion
    const totalBytes = Object.values(languageMap).reduce((sum, bytes) => sum + bytes, 0);
    
    // Convert to percentages and sort
    const sortedLanguages = Object.entries(languageMap)
      .map(([lang, bytes]) => {
        const percentage = totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(2) : '0';
        return [lang, percentage];
      })
      .sort(([, a], [, b]) => parseFloat(b as string) - parseFloat(a as string));

    // Get top repos by different metrics (using non-forked repos for stars/forks rankings)
    const topReposByStars = [...nonForkedRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        stars: r.stargazers_count,
        description: r.description,
        language: r.language,
        url: r.html_url,
      }));

    const topReposByForks = [...nonForkedRepos]
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

    // Fetch recent commit messages for roasting (sample from top repos)
    console.log("Fetching commit messages for roasting...");
    const commitMessages: Array<{ repo: string; message: string; date: string }> = [];
    
    // Get commits from top 5 repos by commits
    const topCommitRepos = repoCommitData
      .filter(r => r.commits > 0)
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 5);
    
    for (const repoData of topCommitRepos) {
      try {
        const commits = await githubFetch(
          `/repos/${username}/${repoData.repo}/commits?author=${username}&since=${year}-01-01T00:00:00Z&until=${year}-12-31T23:59:59Z&per_page=20`,
          userToken
        );
        
        if (Array.isArray(commits)) {
          commits.slice(0, 10).forEach((commit: any) => {
            commitMessages.push({
              repo: repoData.repo,
              message: commit.commit.message.split('\n')[0], // First line only
              date: commit.commit.author.date,
            });
          });
        }
      } catch (error) {
        console.log(`Skipping commit messages for ${repoData.repo}`);
      }
    }
    
    console.log(`Fetched ${commitMessages.length} commit messages`);

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
      commitMessages,
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
