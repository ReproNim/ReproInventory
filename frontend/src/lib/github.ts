/**
 * Derives the GitHub repository URL from the current hostname at runtime.
 * Works for any fork deployed to GitHub Pages (*.github.io)
 * and falls back to the canonical upstream repo for local dev.
 */
export function getGitHubRepoUrl(): string {
  const hostname = window.location.hostname;
  const match = hostname.match(/^([^.]+)\.github\.io$/);
  if (match) {
    return `https://github.com/${match[1]}/ReproInventory`;
  }
  // Local dev fallback
  return "https://github.com/ReproNim/ReproInventory";
}
