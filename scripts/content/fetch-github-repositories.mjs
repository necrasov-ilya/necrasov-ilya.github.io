import { readJson, resolveRepoPath, writeJson } from "./shared.mjs";

const GITHUB_USERNAME = "necrasov-ilya";
const OUTPUT_PATH = resolveRepoPath(
  "src",
  "entities",
  "content",
  "model",
  "generated",
  "repositories.json",
);

function mapRepository(repo) {
  return {
    id: repo.id,
    name: repo.name,
    description: repo.description ?? "",
    htmlUrl: repo.html_url,
    homepage: repo.homepage ?? "",
    language: repo.language ?? "",
    topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 4) : [],
    stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
    pushedAt: repo.pushed_at ?? "",
  };
}

async function fetchRepositories() {
  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed&direction=desc`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "nksv-portfolio-content-sync",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("GitHub API returned an unexpected payload");
  }

  return payload
    .filter((repo) => repo && !repo.fork && !repo.archived)
    .sort((left, right) => new Date(right.pushed_at) - new Date(left.pushed_at))
    .map(mapRepository);
}

export async function runGitHubRepositorySync() {
  try {
    const repositories = await fetchRepositories();
    await writeJson(OUTPUT_PATH, {
      generatedAt: new Date().toISOString(),
      repositories,
    });
    console.log(`Saved ${repositories.length} repositories to generated data.`);
  } catch (error) {
    const existing = await readJson(OUTPUT_PATH, { repositories: [] });
    if (Array.isArray(existing?.repositories) && existing.repositories.length > 0) {
      console.warn(
        `GitHub sync skipped: ${error.message}. Reusing ${existing.repositories.length} saved repositories.`,
      );
      return;
    }

    throw error;
  }
}
