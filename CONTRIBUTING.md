# Contributing

This is a curated directory. Quality over quantity.

Every tool listed here should be something that **a real person has used on a real project** to solve a real problem in creative technology. We're not trying to be exhaustive — we're trying to surface the tools that actually matter.

## What Belongs Here

Open-source tools that creative technology studios reach for when building installations, live events, immersive experiences, exhibits, and similar work. The kind of thing where you'd tell a colleague: *"don't build that from scratch, use this instead."*

## How to Add a Tool

1. Fork this repository
2. Edit `data/repos.yaml` and add your entry
3. Open a pull request

### Entry Format

```yaml
- slug: owner/repository
  category: category-name
  notes: >
    What does this tool do? What problem does it solve?
    Have you used it? What was your experience?
    Must be at least 20 characters.
  added_by: your-github-username
```

### Field Requirements

| Field      | Required | Description                                                   |
| ---------- | -------- | ------------------------------------------------------------- |
| `slug`     | Yes      | GitHub `owner/repo` format                                    |
| `category` | Yes      | A short, lowercase category (e.g., `show-control`, `monitoring`) |
| `notes`    | Yes      | Minimum 20 characters. First-hand experience is preferred.    |
| `added_by` | No       | Your GitHub username                                          |

Categories are not predefined — use whatever makes sense and we'll consolidate as the directory grows.

## What We Value in Notes

The notes are the most important part. Good notes help someone decide whether to evaluate a tool before building their own. Consider:

- What problem does this actually solve?
- Have you deployed it in production? How did it hold up?
- What's the learning curve like?
- What hardware or platforms does it run on?
- What would you warn someone about?

## Validation Rules

PRs are automatically validated. A PR will **fail** if:

- The YAML syntax is invalid
- A slug is duplicated
- The repository doesn't exist on GitHub
- The repository is private or archived
- Notes are shorter than 20 characters

## What We Don't Accept

- Tools nobody has actually used — don't add something just because it looks interesting
- Private or archived repositories
- Spam or self-promotion without substance
- Paid listings — this directory is free

## The Bigger Picture

Creative technology studios keep rebuilding the same infrastructure. This directory is a starting point for figuring out whether the industry can converge on shared tools instead. If you have thoughts on that, open a discussion.
