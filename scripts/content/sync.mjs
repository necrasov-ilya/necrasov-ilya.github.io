import { runGitHubRepositorySync } from "./fetch-github-repositories.mjs";
import { runTelegramPostSync } from "./fetch-telegram-posts.mjs";

async function run() {
  await runGitHubRepositorySync();
  await runTelegramPostSync();
}

run().catch((error) => {
  console.error(`Content sync failed: ${error.message}`);
  process.exitCode = 1;
});
