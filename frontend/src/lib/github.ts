/**
 * Use the canonical repository for issue creation so submissions always land
 * in the repo that owns the automation workflow, even when the site is served
 * from a forked GitHub Pages deployment.
 */
export function getGitHubRepoUrl(): string {
  const configuredRepo = (import.meta.env.VITE_GITHUB_REPO || "").trim();
  if (configuredRepo) {
    return configuredRepo.replace(/\/+$/, "");
  }

  // Keep issue creation in the canonical upstream repo so the workflow is triggered there.
  return "https://github.com/ReproNim/ReproInventory";
}
