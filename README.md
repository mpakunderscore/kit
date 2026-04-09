# kit.mpak.space

`kit.mpak.space` is a small full-stack diagnostics dashboard for browser/runtime inspection.
It combines a React frontend and a Node.js/Express backend to show what the current browser can do, what permissions it can request, and what runtime/network context is currently available.

## What this project is

This project is an engineering-focused "environment snapshot" tool.
It renders a structured page with sections for:

- User identity (UUID persisted in SQLite via Prisma)
- Web APIs that require permission (interactive checks)
- Web APIs that do not require permission (availability checks)
- Browser/session/device metadata (language, platform, viewport, storage estimates, and more)
- Network metrics (IP, ping, estimated downlink)

The frontend computes browser-side values and API capability checks, while the backend provides stable server-side data and lightweight network probe endpoints.

## Why this project exists

The goal is to have one place where you can quickly understand a browser execution context without opening multiple devtools panels or external services.

It is useful for:

- Debugging browser-specific behavior and capability mismatches
- Quick manual compatibility checks for modern and experimental Web APIs
- Verifying permission UX paths (granted/denied/prompt/unsupported)
- Collecting baseline diagnostics before reproducing frontend bugs
- Seeing build/runtime metadata (version, git commit, branch, build time)

In short: it helps developers answer "what is available in this environment right now?" quickly and consistently.

## Tech stack

- Frontend: React 19 + TypeScript + Vite
- Backend: Node.js + Express 5 + TypeScript
- Database: SQLite + Prisma (`User` table for persisted UUID)
- Tooling: ESLint, Stylelint, Prettier

## Very short run guide

```bash
npm install
npm run dev:server
npm run dev:client
```

Open `http://localhost:5173`.

(If needed, check `.env` for `PORT` and `DATABASE_URL`.)
