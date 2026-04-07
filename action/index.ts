/**
 * GitHub Action entry point for screenshottr.
 *
 * This is a scaffold — full implementation will:
 * 1. Parse inputs (url, pages, mode, compare)
 * 2. Capture screenshots for each page/selector
 * 3. Optionally compare against base branch screenshots
 * 4. Upload screenshots as artifacts
 * 5. Post a PR comment with images
 */

import { screenshot } from "../src/screenshot";
import type { ScreenshotOptions } from "../src/types";

// GitHub Actions toolkit — will be added as a dependency
// import * as core from "@actions/core";
// import * as github from "@actions/github";
// import * as artifact from "@actions/artifact";

interface ActionInputs {
  url: string;
  pages: string[];
  mode: "default" | "reference";
  compare: boolean;
  uploadArtifact: boolean;
  comment: boolean;
}

function parseInputs(): ActionInputs {
  // TODO: Replace with @actions/core.getInput() calls
  return {
    url: process.env.INPUT_URL || "http://localhost:3000",
    pages: (process.env.INPUT_PAGES || "/").split("\n").filter(Boolean),
    mode: (process.env.INPUT_MODE || "default") as "default" | "reference",
    compare: process.env.INPUT_COMPARE === "true",
    uploadArtifact: process.env.INPUT_UPLOAD_ARTIFACT !== "false",
    comment: process.env.INPUT_COMMENT !== "false",
  };
}

function parsePage(
  line: string,
  baseUrl: string
): ScreenshotOptions {
  const parts = line.trim().split(/\s+/);
  const options: ScreenshotOptions = { url: baseUrl };

  for (const part of parts) {
    if (part.startsWith("--selector=")) {
      options.selector = part.replace("--selector=", "");
    } else if (part.startsWith("--wait=")) {
      options.extraWait = parseInt(part.replace("--wait=", ""), 10) || 0;
    } else if (part.startsWith("/")) {
      options.url = `${baseUrl}${part}`;
    } else if (!part.startsWith("-")) {
      options.label = part;
    }
  }

  return options;
}

async function run() {
  const inputs = parseInputs();
  const results = [];

  console.log(`📸 screenshottr action`);
  console.log(`   Base URL: ${inputs.url}`);
  console.log(`   Pages: ${inputs.pages.length}`);
  console.log(`   Mode: ${inputs.mode}`);

  for (const page of inputs.pages) {
    const options = parsePage(page, inputs.url);
    options.mode = inputs.mode;
    options.outDir = "./screenshottr-results";

    try {
      const result = await screenshot(options);
      results.push(result);
      console.log(`✅ ${result.filepath}`);
    } catch (err: any) {
      console.error(`❌ Failed: ${page} — ${err.message}`);
      // TODO: core.setFailed(err.message)
    }
  }

  // TODO: Upload artifacts
  // TODO: Post PR comment with images
  // TODO: If compare=true, diff against base branch

  console.log(`\n📸 Captured ${results.length} screenshots`);

  // TODO: core.setOutput("screenshots", JSON.stringify(results.map(r => r.filepath)))
}

run();
