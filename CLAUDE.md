# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**slirev** (`@miyakoh/slirev`) is a CLI tool that generates a Web UI for reviewing Marp presentation HTML decks. It captures slide screenshots via Playwright/Chromium, serves a review interface with per-slide commenting, layout pattern selection (39 patterns), and JSON export. All generated HTML is held in memory — no files are written to disk.

## Build & Run

```bash
npm run build          # TypeScript compile (tsc) → dist/
npm start              # Run CLI (node dist/index.js)
npx playwright install chromium   # Required one-time setup
```

No linter, formatter, or test framework is configured.

## Architecture

Single-file CLI application: `src/index.ts` (compiled to `dist/index.js`).

### Key Components (all in src/index.ts)

1. **Pattern data** — Hardcoded array of 39 layout patterns with thumbnail index mappings. Thumbnails are PNG files in `pattern-thumbnails/`, converted to base64 data URIs at runtime via Sharp.

2. **HTTP servers** — Two server types using Node built-in `http`:
   - `serve()` — Simple static file server (used internally to serve deck HTML to Chromium)
   - `createAppServer()` — Main app server with API routes:
     - `GET /api/files` — List deck HTML files in CWD
     - `GET /api/generate?file=<path>` — Capture slides and generate review HTML
     - `GET /api/shutdown` — Graceful server stop
     - `GET /review/*` — Serve cached review pages from in-memory `reviewCache` Map
     - `GET /` — Serve picker UI

3. **Slide capture** (`captureSlides()`) — Launches headless Chromium, detects Bespoke vs Standard Marp format, screenshots each slide, extracts h1/h2 titles. Bespoke mode uses keyboard navigation; Standard mode toggles SVG visibility.

4. **HTML generation** (`generate()`) — Reads `templates/review-template.html`, injects deck name, path, pattern data, slide images, and titles via placeholder replacement (`__DECK_NAME__`, `__SLIDE_IMAGES__`, etc.).

5. **CLI entry** (`main()`) — Two modes:
   - **Picker mode** (no args): Serves file selection UI, user picks a deck
   - **Direct mode** (path arg): Generates review for specified deck immediately
   - `--no-browser` flag suppresses auto-open

### Templates

- `templates/picker.html` — File selection UI (vanilla HTML/JS)
- `templates/review-template.html` — Review UI with comments, navigation, pattern modal, JSON export (vanilla HTML/JS, localStorage for state)

### Data Flow

```
CLI start → checkChromium → createAppServer
  → /api/generate → captureSlides (Playwright) → generate (template injection)
  → reviewCache.set() → serve from memory
```

## Conventions

- ESM modules (`"type": "module"` in package.json), target ES2022, Node16 module resolution
- Strict TypeScript enabled
- No frameworks — vanilla Node.js http server, vanilla browser JS in templates
- Japanese used for UI labels, console messages, and pattern names
- MIYAKOH design system: Navy (#1B4565) / Teal (#3E9BA4)

## Bundled Claude Code Skills

Located in `.claude/skills/` — these are invoked during the slide review workflow:

- **slide-style-MIYAKOH** — Apply MIYAKOH style guide and layout patterns to Marp slides
- **layout-fix** — Detect and fix layout issues by rendering with Playwright
- **slimg** — Generate images via Google Imagen 4
- **svg-creator** — Generate SVG diagrams and icons
