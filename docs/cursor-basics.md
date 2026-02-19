# Cursor basics — team reference

Quick reference for using [Cursor](https://cursor.com) on this project. Cursor is a code editor built on VS Code with built-in AI (Chat, Composer, etc.).

## Installing Cursor

1. Download from [cursor.com](https://cursor.com).
2. Install and open Cursor.
3. Sign in or create an account if you use Cursor’s AI features.

## Opening the project

- **File → Open Folder** and choose the project root (the folder that contains `package.json` and `app/`).
- Or from terminal: `cursor .` (if the `cursor` CLI is installed).

## Useful Cursor features for this repo

| Feature | What it does |
|--------|----------------|
| **Chat (Cmd/Ctrl + L)** | Ask questions about the codebase, get explanations, or small edits. Reference files with `@filename`. |
| **Composer (Cmd/Ctrl + I)** | Multi-file edits and new features. Describe what you want; it can create or change several files. |
| **@ in Chat** | Type `@` and add files, folders, or docs so the AI has context (e.g. `@app/admin @docs/README.md`). |
| **Terminal** | Integrated terminal: run `npm install`, `npm run dev`, and Git commands without leaving Cursor. |
| **Source control** | Git panel for staging, committing, and viewing diffs. |

## Connecting Cursor to Git (GitHub)

Cursor can use your existing Git setup and connect to GitHub so you can push, pull, and open PRs from the editor.

1. **Sign in with GitHub** (in Cursor: **Settings → Account**, or when prompted). That links your Cursor account to GitHub for auth.
2. **Use the Source Control panel**: **Cmd/Ctrl + Shift + G** (or the branch icon in the sidebar). You’ll see changed files, can stage, commit, push, and pull. If the repo has a remote (e.g. `origin`), push/pull use it.
3. **Clone a repo**: **File → Open from GitHub** (or clone via terminal and then **File → Open Folder**). After opening the folder, Git and the remote are available in Source Control.
4. **First time pushing**: If you push and GitHub asks for login, Cursor can open the browser or use the built-in GitHub auth flow. Approve access when prompted.

You still run Git commands in the integrated terminal when you prefer (e.g. `git pull origin main`, `npm run build` before push). See [Git basics](git-basics.md) for workflow.

## Which model to use

Cursor lets you pick an AI model in Chat and Composer. Model names can change; use this as a guide and check the model dropdown in the app.

| Model type | Best for |
|------------|----------|
| **Faster / lighter** | Quick questions, small edits, lint fixes, and short explanations. Good when you want a fast response and don’t need heavy reasoning. |
| **Default / balanced** | Everyday coding: understanding code, medium-sized refactors, and following project context. Use for most Chat and Composer work. |
| **Larger / advanced** | Complex multi-file changes, architecture decisions, tricky bugs, and long documents. Use when the task is big or nuanced and you can wait a bit longer. |

If you’re unsure, start with the default; switch to the faster model for small stuff and to the advanced model when the default isn’t enough.

## Project-specific tips

- **Paths**: This is a Next.js app. Important areas: `app/` (pages and layouts), `lib/` (actions, utils), and later `prisma/` if you add a database.
- **Reference docs**: Point the AI at team docs when asking setup or workflow questions, e.g. “Using the instructions in `docs/node-and-npm.md`, how do I run the app?”
- **Rules**: If the project has `.cursor/rules` or a `RULE.md`, the AI will use them; read those for project conventions.

## Keyboard shortcuts (macOS / Windows)

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + L | Open AI Chat |
| Cmd/Ctrl + I | Open Composer |
| Cmd/Ctrl + ` | Toggle terminal |
| Cmd/Ctrl + Shift + G | Source Control (Git) |

(Linux shortcuts are usually the same as Windows, with Ctrl.)

## Where to put this

Keep this file in the repo (e.g. `docs/cursor-basics.md`) so the whole team can use it. Link from `docs/README.md` or the main README.
