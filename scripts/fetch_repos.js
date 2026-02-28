#!/usr/bin/env node

/**
 * Reads /data/repos.yaml, fetches metadata from the GitHub REST API for each
 * repository, computes activity status, and writes /generated/repos.json.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_... node scripts/fetch_repos.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { computeActivityStatus, computeCommitPace } = require('./compute_activity');

const ROOT = path.resolve(__dirname, '..');
const YAML_PATH = path.join(ROOT, 'data', 'repos.yaml');
const OUT_PATH = path.join(ROOT, 'generated', 'repos.json');
const PUBLIC_COPY = path.join(ROOT, 'public', 'repos.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

function apiHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'creative-tech-directory',
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchRepo(slug) {
  const res = await fetch(`https://api.github.com/repos/${slug}`, {
    headers: apiHeaders(),
  });
  if (!res.ok) {
    throw new Error(`GitHub API error for ${slug}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function fetchCommitActivity(slug) {
  const res = await fetch(
    `https://api.github.com/repos/${slug}/stats/commit_activity`,
    { headers: apiHeaders() }
  );
  // Stats endpoints return 202 while computing — retry once after a pause
  if (res.status === 202) {
    await new Promise((r) => setTimeout(r, 3000));
    const retry = await fetch(
      `https://api.github.com/repos/${slug}/stats/commit_activity`,
      { headers: apiHeaders() }
    );
    if (!retry.ok) return null;
    return retry.json();
  }
  if (!res.ok) return null;
  return res.json();
}

function buildEntry(apiData, commitStats, yamlEntry) {
  const commitPace = computeCommitPace(commitStats);
  const activityStatus = computeActivityStatus(
    apiData.created_at,
    apiData.pushed_at,
    apiData.archived,
    commitPace
  );

  return {
    slug: apiData.full_name,
    name: apiData.name,
    url: apiData.html_url,
    description: apiData.description || '',
    stars: apiData.stargazers_count,
    forks: apiData.forks_count,
    open_issues: apiData.open_issues_count,
    created_at: apiData.created_at,
    last_commit: apiData.pushed_at,
    activity_status: activityStatus,
    commit_pace: commitPace,
    license: apiData.license ? apiData.license.spdx_id || apiData.license.name : 'None',
    language: apiData.language || 'Unknown',
    topics: apiData.topics || [],
    category: yamlEntry.category,
    notes: yamlEntry.notes.trim(),
  };
}

async function main() {
  const raw = fs.readFileSync(YAML_PATH, 'utf8');
  const data = yaml.load(raw);

  if (!data || !Array.isArray(data.repos)) {
    console.error('Invalid repos.yaml: expected a "repos" array');
    process.exit(1);
  }

  console.log(`Processing ${data.repos.length} repositories...`);

  const results = [];
  for (const entry of data.repos) {
    try {
      console.log(`  Fetching ${entry.slug}...`);
      const [apiData, commitStats] = await Promise.all([
        fetchRepo(entry.slug),
        fetchCommitActivity(entry.slug),
      ]);
      results.push(buildEntry(apiData, commitStats, entry));
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      process.exit(1);
    }
  }

  const json = JSON.stringify(results, null, 2);

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, json);
  console.log(`Wrote ${results.length} entries to ${OUT_PATH}`);

  // Copy into public/ so local dev server can serve it alongside index.html
  fs.writeFileSync(PUBLIC_COPY, json);
  console.log(`Copied to ${PUBLIC_COPY}`);
}

main();
