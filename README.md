# screenshottr

Screenshot tool for dev workflows and AI coding agents. Captures full pages or specific elements, handles lazy-loaded content, and auto-increments filenames so you never overwrite a previous capture.

Works as a **CLI**, a **library**, a **Claude Code skill**, and a **GitHub Action**.

## Install

```sh
# As a project dependency
bun add screenshottr puppeteer
npm install screenshottr puppeteer

# Or globally
bun add -g screenshottr
```

> Puppeteer is a peer dependency — you bring your own version.

## CLI

```sh
# Full page screenshot of localhost:3000
screenshottr

# Screenshot a specific page
screenshottr http://localhost:3000/services

# Screenshot a specific element
screenshottr --selector="#hero" hero-v1

# Path shorthand (appends to localhost:3000)
screenshottr /about

# Reference mode — 1920px viewport, saves to ./references/
screenshottr https://example.com --reference

# Handle JS-heavy / lazy-loaded sites
screenshottr https://example.com --scroll --wait=3000
screenshottr https://example.com --wait-for=".hero-image"
```

### Options

| Flag | Description |
|---|---|
| `--selector=SEL` | Capture a specific element instead of full page |
| `--reference`, `-r` | Reference mode: 1920x1080 viewport, saves to `./references/` |
| `--width=N` | Override viewport width |
| `--out=DIR` | Custom output directory |
| `--wait=MS` | Extra wait (ms) after page load |
| `--wait-for=SEL` | Wait for a selector to appear before capture |
| `--scroll` | Scroll page first to trigger lazy-loaded images |
| `--help`, `-h` | Show help |

### Output

Screenshots save to `./screenshots/` (or `./references/` in reference mode) with auto-incremented filenames:

```
screenshots/screenshot-1.png
screenshots/screenshot-2-hero-hero-v1.png
screenshots/screenshot-3.png
```

Files are never overwritten.

## Library

```ts
import { screenshot } from "screenshottr";

const result = await screenshot({
  url: "http://localhost:3000",
  selector: "#hero",
  label: "hero-v1",
});

console.log(result.filepath);  // ./screenshots/screenshot-1-hero-hero-v1.png
console.log(result.width);     // 1440
console.log(result.height);    // 900
```

### Options

```ts
interface ScreenshotOptions {
  url?: string;            // Default: "http://localhost:3000"
  selector?: string;       // CSS selector for element capture
  label?: string;          // Appended to filename
  mode?: "default" | "reference";
  extraWait?: number;      // Additional ms to wait after load
  waitForSelector?: string;
  scrollPage?: boolean;
  widthOverride?: number;
  outDir?: string;         // Override output directory
}
```

### Return value

```ts
interface ScreenshotResult {
  filepath: string;   // Full path to saved file
  filename: string;   // Just the filename
  width: number;      // Viewport width used
  height: number;     // Viewport height used
  selector?: string;  // Selector used (if any)
  url: string;        // URL that was captured
}
```

## Claude Code Skill

screenshottr ships with a skill file that teaches AI coding agents how to use it. To install:

```sh
# Copy the skill to your Claude Code skills directory
cp node_modules/screenshottr/skill/screenshottr.md ~/.claude/skills/
```

Once installed, Claude Code will automatically know how to capture and compare screenshots during development.

## GitHub Action

Add visual regression screenshots to your pull requests:

```yaml
- name: Screenshot pages
  uses: jnewman12/screenshottr@v1
  with:
    url: http://localhost:3000
    pages: |
      /
      /services
      / --selector="#hero" hero
```

See [action/action.yml](action/action.yml) for all inputs and outputs.

## Modes

| | Default | Reference |
|---|---|---|
| Viewport | 1440 × 900 | 1920 × 1080 |
| Output dir | `./screenshots/` | `./references/` |
| Timeout | 30s | 60s |
| Use case | Your local dev site | External sites, design references |

## License

MIT
