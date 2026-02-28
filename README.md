# Creative Tech Directory

In creative technology — interactive installations, immersive experiences, museum exhibits, live events — studios keep building the same infrastructure over and over. CMS platforms, show control, device fleet management, process monitoring, protocol bridges... the same problems come up on nearly every project.

This is a curated directory of **real tools being used by real people to solve real problems** in creative technology practice. Not an exhaustive list. Not a link dump. Every entry is here because someone on the team has used it, evaluated it, or seen it deployed in production.

The longer-term question: **can the industry align around shared tools instead of every studio building their own?** This directory is a small step toward answering that.

## How It Works

1. Contributors curate entries in `data/repos.yaml`
2. On merge to `main`, a GitHub Action fetches live metadata from the GitHub API
3. Activity status is computed transparently from the last push date
4. GitHub Pages deploys a static site — no backend, no accounts, no runtime API calls

## Activity Status

Calibrated for production infrastructure tools, not fast-moving web frameworks. Status is computed from repo age, commit velocity, and archive state.

| Status             | Condition                                            | Signal                                    |
| ------------------ | ---------------------------------------------------- | ----------------------------------------- |
| **Stable**         | 12+ months old, moderate commit pace (≤ 5/wk)        | Mature, not churning — probably what you want |
| **In Development** | 12+ months old, high commit pace (> 5/wk)            | Lots of changes happening — check the changelog |
| **New**            | Created less than 12 months ago                      | Young project, still proving itself       |
| **Stale**          | Last commit over 18 months ago                       | Possibly abandoned                        |
| **Archived**       | Archived on GitHub                                   | Explicitly end-of-life                    |

Each tool also shows its **commit pace** (average commits/week over the last 3 months) so you can judge for yourself.

## Adding a Tool

See [CONTRIBUTING.md](CONTRIBUTING.md). Quality over quantity — we want tools that practitioners have actually used, not theoretical options.

## Local Development

```bash
npm install

# Generate repos.json (requires a GitHub token)
GITHUB_TOKEN=ghp_... node scripts/fetch_repos.js

# Serve locally
npx serve public
```

## Project Structure

```
data/repos.yaml         - Curated list of tools
generated/repos.json    - Auto-generated metadata (do not edit)
scripts/                - Fetch, compute, and validate scripts
public/                 - Static frontend (HTML/CSS/JS)
.github/workflows/      - CI/CD pipelines
```

## License

MIT
