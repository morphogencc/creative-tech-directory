/**
 * Computes the activity status for a repository.
 *
 * Uses repo age (created_at), recency (pushed_at), commit velocity,
 * and archived flag.
 *
 * Statuses:
 *   "archived"       — archived on GitHub
 *   "stale"          — last commit > 18 months ago
 *   "new"            — repo created < 12 months ago
 *   "in-development" — 12+ months old, high commit rate (> 5/wk avg)
 *   "stable"         — 12+ months old, moderate or low commit rate
 */
function computeActivityStatus(createdAt, pushedAt, archived, commitPace) {
  if (archived) return 'archived';

  const now = new Date();
  const lastPush = new Date(pushedAt);
  const created = new Date(createdAt);
  const daysSincePush = (now - lastPush) / (1000 * 60 * 60 * 24);
  const daysSinceCreated = (now - created) / (1000 * 60 * 60 * 24);

  if (daysSincePush > 540) return 'stale';
  if (daysSinceCreated < 365) return 'new';
  if (commitPace > 5) return 'in-development';
  return 'stable';
}

/**
 * Computes average commits/week from the GitHub commit_activity stats endpoint.
 *
 * Input: array of 52 weekly objects from GET /repos/{owner}/{repo}/stats/commit_activity
 *        Each object has { total, week, days }. Ordered oldest → newest.
 *
 * Returns average commits/week over the last 13 weeks (3 months).
 */
function computeCommitPace(weeklyStats) {
  if (!weeklyStats || weeklyStats.length === 0) return 0;

  const recent = weeklyStats.slice(-13);
  const total = recent.reduce((sum, w) => sum + w.total, 0);
  return Math.round((total / recent.length) * 10) / 10;
}

module.exports = { computeActivityStatus, computeCommitPace };
