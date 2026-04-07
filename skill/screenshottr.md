---
name: screenshottr
description: Capture screenshots of web pages for visual review, design comparison, and visual regression testing.
trigger: screenshot, capture, screenshottr, visual check, compare design, visual regression
---

# screenshottr — Screenshot Tool

Use `screenshottr` to capture screenshots of web pages or specific elements. The tool saves PNGs with auto-incremented filenames that never overwrite previous captures.

## CLI Usage

```sh
# Full page screenshot of localhost:3000
screenshottr

# Screenshot a specific page
screenshottr http://localhost:3000/services

# Screenshot with a label
screenshottr hero-v1

# Screenshot a specific element by CSS selector
screenshottr --selector="#hero" hero

# Reference mode — wider viewport (1920px), saves to ./references/
screenshottr https://example.com --reference

# Handle JS-heavy sites
screenshottr https://example.com --scroll --wait=3000
screenshottr https://example.com --wait-for=".hero-image"
```

## Options

| Flag | Description |
|---|---|
| `--selector=SEL` | Capture a specific element instead of full page |
| `--reference`, `-r` | Reference mode: 1920x1080, saves to `./references/` |
| `--width=N` | Override viewport width |
| `--out=DIR` | Custom output directory |
| `--wait=MS` | Extra wait after page load (for animations, JS) |
| `--wait-for=SEL` | Wait for a selector to appear before capture |
| `--scroll` | Scroll page first to trigger lazy-loaded images |

## Programmatic Usage

```ts
import { screenshot } from "screenshottr";

const result = await screenshot({
  url: "http://localhost:3000",
  selector: "#hero",
  label: "hero-v1",
});

console.log(result.filepath); // ./screenshots/screenshot-1-hero-hero-v1.png
```

## After Capturing

Read the saved PNG file to view the screenshot. Compare against reference images or previous screenshots to check for visual regressions.

## Design Comparison Workflow

1. Capture a reference: `screenshottr https://example.com --reference ref`
2. Capture your version: `screenshottr --selector="#hero" current`
3. Read both PNGs and compare visually
4. Note differences in spacing, fonts, colors, alignment
5. Fix code and recapture
6. Repeat until matching

## Visual Regression Workflow

1. Capture baseline screenshots before changes
2. Make code changes
3. Recapture the same pages/selectors
4. Compare before and after
5. Verify only intended changes are visible
