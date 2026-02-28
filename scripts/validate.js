#!/usr/bin/env node

/**
 * PR validation script.
 *
 * Checks:
 *   1. YAML is syntactically valid
 *   2. No duplicate slugs
 *   3. Each repository exists, is public, and is not archived
 *   4. Notes are at least 20 characters
 *   5. Optionally rejects forks
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const YAML_PATH = path.resolve(__dirname, '..', 'data', 'repos.yaml');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REJECT_FORKS = process.env.REJECT_FORKS === 'true';

async function checkRepo(slug) {
  const url = `https://api.github.com/repos/${slug}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'github-repo-directory-validator',
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (res.status === 404) {
    return { ok: false, reason: `Repository "${slug}" does not exist` };
  }
  if (!res.ok) {
    return { ok: false, reason: `GitHub API error for "${slug}": ${res.status}` };
  }

  const data = await res.json();

  if (data.private) {
    return { ok: false, reason: `"${slug}" is a private repository` };
  }
  if (data.archived) {
    return { ok: false, reason: `"${slug}" is archived` };
  }
  if (REJECT_FORKS && data.fork) {
    return { ok: false, reason: `"${slug}" is a fork` };
  }

  return { ok: true };
}

async function main() {
  const errors = [];

  // 1. Parse YAML
  let data;
  try {
    const raw = fs.readFileSync(YAML_PATH, 'utf8');
    data = yaml.load(raw);
  } catch (err) {
    console.error(`YAML parse error: ${err.message}`);
    process.exit(1);
  }

  if (!data || !Array.isArray(data.repos)) {
    console.error('Invalid repos.yaml: expected a "repos" array');
    process.exit(1);
  }

  // 2. Check for duplicate slugs
  const slugs = data.repos.map((r) => r.slug);
  const seen = new Set();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      errors.push(`Duplicate slug: "${slug}"`);
    }
    seen.add(slug);
  }

  // 3. Validate each entry
  for (const entry of data.repos) {
    // Slug format
    if (!entry.slug || !/^[^/]+\/[^/]+$/.test(entry.slug)) {
      errors.push(`Invalid slug format: "${entry.slug}" (expected owner/repo)`);
      continue;
    }

    // Category required
    if (!entry.category || typeof entry.category !== 'string') {
      errors.push(`Missing or invalid category for "${entry.slug}"`);
    }

    // Notes length
    const notes = (entry.notes || '').trim();
    if (notes.length < 20) {
      errors.push(
        `Notes for "${entry.slug}" are too short (${notes.length} chars, minimum 20)`
      );
    }

    // Check repo via API
    const result = await checkRepo(entry.slug);
    if (!result.ok) {
      errors.push(result.reason);
    }
  }

  if (errors.length > 0) {
    console.error('Validation failed:\n');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`All ${data.repos.length} entries passed validation.`);
}

main();
