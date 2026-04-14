# slirev - Marp Slide Review Tool

> **Note:** Run with `npx slirev` if not installed globally.

## Quick Reference

```bash
npx slirev                              # File picker mode (browse decks in CWD)
npx slirev <path/to/deck.html>          # Direct review mode
npx slirev --no-browser                 # Server only, no auto-open
```

## Installation

```bash
# First time setup: install Chromium for Playwright
npx playwright install chromium
```

## File Picker Mode

Launch without arguments to browse and select Marp deck HTML files in the current directory.

```bash
npx slirev
```

- Recursively searches CWD for `.html` files (up to 4 levels deep)
- Excludes: `node_modules`, `.git`, `dist`, `*-review.html`, `*-nav.html`
- Click a file to generate the review page

## Direct Review Mode

Specify a deck file path to jump straight into review.

```bash
npx slirev output/my-deck/deck.html
npx slirev dist/presentation.html
```

## Review UI Features

The review page provides:

| Feature | Description |
|---------|-------------|
| Slide preview | Screenshot-based preview of each slide |
| Navigation | `←` `→` keys or buttons to switch slides |
| Comments | Add/delete comments per slide, auto-saved to localStorage |
| Quick actions | One-click insert of skill invocation text |
| Layout selector | 39 slide layout patterns with thumbnails |
| JSON export | Copy all comments as JSON to clipboard |

## Common Workflows

### Review a presentation

```bash
cd my-presentation-project
npx slirev
# Select deck in browser → review slides → export comments as JSON
```

### Review a specific file without opening browser

```bash
npx slirev dist/deck.html --no-browser
# Access the printed URL manually
```

## Supported Formats

- Standard Marp HTML (uses `svg[data-marpit-svg]`)
- Bespoke mode Marp HTML (keyboard navigation based)

## Requirements

- Node.js >= 18
- Chromium (installed via `npx playwright install chromium`)
