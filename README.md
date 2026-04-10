# KIT

**KIT** is a reference repo and starting point for client–server apps you can grow in one direction and ship **on the web, on the desktop, and (via the same API) on mobile**.

It already wires up the usual pieces: a [React](https://react.dev/) client, a [Node.js](https://nodejs.org/)/[Express](https://expressjs.com/) API, [SQLite](https://www.sqlite.org/) with [Prisma](https://www.prisma.io/) (separate schemas for the server and the local app), a [Vite](https://vitejs.dev/) build, and [Electron](https://www.electronjs.org/) for a native shell. Fork or copy the repo and extend the product without assembling the stack from scratch.

## Why it exists

- **One foundation, multiple shells**: browser, desktop ([Electron](https://www.electronjs.org/)), mobile ([Capacitor](https://capacitorjs.com/)) — same web client and HTTP API.
- **Clear layout**: frontend in `src/`, server in `server/`, desktop bridge in `electron/`, shared contracts in `src/shared` and Electron mirrors.
- **A working sample**: a full “environment snapshot” app (browser capabilities, metadata, network, build info) to illustrate patterns, not only an empty template.

## What’s inside

An engineering-style dashboard: user id (UUID in [SQLite](https://www.sqlite.org/)), Web APIs with and without permissions, browser/session metadata, network metrics. The client uses the browser runtime; the backend serves stable server-side data and light network probes.

## Stack

| Layer   | Technologies                                                                                               |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| Runtime | [Node.js](https://nodejs.org/) ≥ 22                                                                        |
| Client  | [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| Server  | [Express](https://expressjs.com/) 5, [TypeScript](https://www.typescriptlang.org/)                         |
| Data    | [SQLite](https://www.sqlite.org/), [Prisma](https://www.prisma.io/) (server and “app” schemas)             |
| Desktop | [Electron](https://www.electronjs.org/), [electron-builder](https://www.electron.build/)                   |
| Mobile  | [Capacitor](https://capacitorjs.com/) (iOS / Android; wraps the built web client)                          |
| Quality | [ESLint](https://eslint.org/), [Stylelint](https://stylelint.io/), [Prettier](https://prettier.io/)        |

## Quick start

```bash
npm install
npm run dev:server
npm run dev:client
```

Then open `http://localhost:5173`. API port and environment variables: copy `config/env/.env.example` to `.env` at the repository root.

## Desktop (Electron)

[Electron](https://www.electronjs.org/) wraps the same frontend as the browser.

**Constraint:** [Express](https://expressjs.com/) does not run inside Electron. Run `dev:server` separately when you need full network sections.

- Local identity: [SQLite](https://www.sqlite.org/) in the app data folder; the renderer talks to it via a secure preload (`window.desktopApi`).

### Development

Two terminals: [Vite](https://vitejs.dev/) in one, Electron in the other.

```bash
npm run dev:client
# other terminal:
npm run electron:dev
```

### Build

```bash
npm run build
npm run electron:build:desktop
```

Output: `dist/release` (see `package.json` → `build`).

## Mobile (Capacitor)

[Capacitor](https://capacitorjs.com/) packages the **built** web client (`npm run build:client`) into native iOS/Android shells. HTTP traffic uses the same backend; reuse types and contracts from `src/shared`.

**Constraint:** Capacitor is the chosen stack; native projects and npm scripts may be added over time (`cap sync`, [Xcode](https://developer.apple.com/xcode/), [Android Studio](https://developer.android.com/studio)).

### Development

After Capacitor is wired into the repo, the usual loop is: build the web app, sync native projects, run or open them from Xcode / Android Studio (exact commands will match the integrated setup).

### Build

Release builds go through the native toolchains (App Store, Play Store, or ad hoc) once the Capacitor projects exist.

## Commands

| Command                   | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `npm run build`           | Build server and client                          |
| `npm run check`           | Typecheck, lint, full build                      |
| `npm run prisma:server:*` | Prisma CLI for the server database               |
| `npm run prisma:app:*`    | Prisma CLI for the local app database (Electron) |

---

_npm package name may remain `kit.mpak.space`; the desktop app title is **KIT** (`productName` in `package.json`)._
