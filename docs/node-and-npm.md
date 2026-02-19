# Node.js and npm — install and run

## Installing Node and npm

This project uses **Node.js** (JavaScript runtime) and **npm** (package manager). They are needed to install dependencies and run the app.

### Option 1: Official installer (recommended for beginners)

1. Go to [https://nodejs.org](https://nodejs.org).
2. Download the **LTS** version.
3. Run the installer and follow the steps.
4. Restart your terminal, then check:

   ```bash
   node -v   # e.g. v20.x.x
   npm -v    # e.g. 10.x.x
   ```

### Option 2: nvm (Node Version Manager)

Useful if you work on multiple projects with different Node versions.

- **macOS/Linux**: [nvm](https://github.com/nvm-sh/nvm)
- **Windows**: [nvm-windows](https://github.com/coreybutler/nvm-windows)

After installing nvm:

```bash
nvm install 20
nvm use 20
node -v
npm -v
```

### Verify installation

```bash
node -v   # Should show v18.x or v20.x (LTS)
npm -v    # Should show 9.x or 10.x
```

---

## Project setup and run instructions

### 1. Clone the repo (if you haven’t)

```bash
git clone https://github.com/JulienrBourgeois/Dorm-AI.git
cd Dorm-AI
```

If the app lives in a subfolder (e.g. `dorm-ai`), then:

```bash
cd dorm-ai
```

### 2. Install dependencies

From the **project root** (where `package.json` is):

```bash
npm install
```

This reads `package.json` and installs everything into `node_modules/`. Run it after cloning and whenever dependencies change (e.g. after a pull).

### 3. Run the app

| Command | What it does |
|--------|----------------|
| `npm run dev` | Start the **development** server (hot reload). Use while coding. |
| `npm run build` | **Build** for production. Run before deploy or `npm start`. **Always run before pushing to Git.** |
| `npm start` | Run the **production** build (run `npm run build` first). |
| `npm run lint` | Run **ESLint** to check code style and issues. |

**Typical workflow:**

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Environment variables (when added)

If the project gets a `.env.example` or `.env.local.example`:

1. Copy it to `.env.local`:  
   `cp .env.example .env.local` (or the name your team uses).
2. Fill in the values (database URL, API keys, etc.). Do **not** commit `.env.local` or real secrets.

---

## Troubleshooting

| Problem | What to try |
|--------|--------------|
| `node: command not found` | Node isn’t installed or not on your PATH. Reinstall Node or restart the terminal. |
| `npm: command not found` | Usually fixed by reinstalling Node (npm is included). |
| `EACCES` or permission errors | Avoid `sudo npm`. Fix npm’s global directory permissions or use nvm. |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, then run `npm install` again. |
| Port 3000 in use | Stop the other process using 3000, or use a different port: `npm run dev -- -p 3001`. |

---

## Where to put this

Keep this file in the repo (e.g. `docs/node-and-npm.md`) so the whole team can use it. Point new teammates to `docs/README.md` for the full list of references.
