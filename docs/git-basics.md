# Git basics — team reference

Quick reference for using Git on this project. Repo: [Dorm-AI](https://github.com/JulienrBourgeois/Dorm-AI).

## One-time setup

### Install Git

- **macOS**: `xcode-select --install` or install from [git-scm.com](https://git-scm.com).
- **Windows**: [git-scm.com/download/win](https://git-scm.com/download/win).
- **Linux**: e.g. `sudo apt install git` (Ubuntu/Debian).

Check:

```bash
git --version
```

### Configure name and email (required for commits)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Use the email tied to your GitHub account if you push to GitHub.

---

## Daily workflow

### 1. Get the latest code

From the project folder:

```bash
git pull origin main
```

Use `main` or whatever branch your team uses as the default (e.g. `master`).

### 2. Create a branch for your work

```bash
git checkout -b feature/your-feature-name
```

Examples: `feature/admin-buildings`, `fix/login-redirect`. Use short, clear names.

### 3. Make changes, then stage and commit

```bash
# See what changed
git status

# Stage specific files
git add app/page.tsx
git add lib/actions.ts

# Or stage everything in the project
git add .

# Commit with a clear message
git commit -m "Add building list page and Server Action"
```

Commit often; messages should describe *what* and *why*, not just “fix” or “update.”

### 4. Before you push — run the build

**Always run `npm run build` before pushing to Git.** Fix any build errors locally so the main branch stays green and CI/deploys don't break.

```bash
npm run build
```

If the build fails, fix the errors, then commit and push.

### 5. Push your branch and open a PR

```bash
git push -u origin feature/your-feature-name
```

Then on GitHub: create a **Pull Request** from your branch into `main`. After review and merge, you can delete the branch and pull again:

```bash
git checkout main
git pull origin main
```

---

## Useful commands

| Command | Purpose |
|--------|--------|
| `git status` | See modified/untracked files and current branch |
| `git diff` | See unstaged changes (line-by-line) |
| `git log --oneline -10` | Last 10 commits (short form) |
| `git branch` | List local branches; `*` is current |
| `git checkout main` | Switch to `main` |
| `git pull origin main` | Update `main` from remote |
| `git stash` | Temporarily put changes aside |
| `git stash pop` | Restore stashed changes |

---

## What not to commit

- **Secrets**: API keys, passwords, `.env` or `.env.local` with real values.
- **Build/output**: `node_modules/`, `.next/`, `dist/`, etc. (usually in `.gitignore`.)
- **OS/editor junk**: `.DS_Store`, IDE config with local paths (if team doesn’t share it).

If you accidentally commit a secret, tell the team and rotate the secret; consider using [GitHub’s secret scanning](https://docs.github.com/en/code-security/secret-scanning) and not pushing the key again.

---

## Where to put this

Keep this file in the repo (e.g. `docs/git-basics.md`) so everyone can use it. Link to it from `docs/README.md` or the main README.
