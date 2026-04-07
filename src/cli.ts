import { screenshot } from "./screenshot";
import { DEFAULT_URL } from "./config";
import type { ScreenshotOptions } from "./types";

function parseArgs(args: string[]): ScreenshotOptions {
  let url: string = DEFAULT_URL;
  let selector: string | undefined;
  let label = "";
  let mode: "default" | "reference" = "default";
  let extraWait = 0;
  let waitForSelector: string | undefined;
  let scrollPage = false;
  let widthOverride: number | null = null;

  for (const arg of args) {
    if (arg === "--reference" || arg === "-r") {
      mode = "reference";
    } else if (arg === "--scroll") {
      scrollPage = true;
    } else if (arg.startsWith("--selector=")) {
      selector = arg.replace("--selector=", "");
    } else if (arg.startsWith("--wait=")) {
      extraWait = parseInt(arg.replace("--wait=", ""), 10) || 0;
    } else if (arg.startsWith("--wait-for=")) {
      waitForSelector = arg.replace("--wait-for=", "");
    } else if (arg.startsWith("--width=")) {
      widthOverride = parseInt(arg.replace("--width=", ""), 10) || null;
    } else if (arg.startsWith("--out=")) {
      // handled below
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg.startsWith("http")) {
      url = arg;
    } else if (arg.startsWith("/")) {
      url = `${DEFAULT_URL}${arg}`;
    } else if (arg && !arg.startsWith("-")) {
      label = arg;
    }
  }

  // Parse outDir separately (needs the full arg list)
  const outArg = args.find((a) => a.startsWith("--out="));
  const outDir = outArg ? outArg.replace("--out=", "") : undefined;

  return {
    url,
    selector,
    label,
    mode,
    extraWait,
    waitForSelector,
    scrollPage,
    widthOverride,
    outDir,
  };
}

function printHelp() {
  console.log(`
screenshottr — Screenshot tool for dev workflows and AI agents

Usage:
  screenshottr [url] [label]                     Full page screenshot
  screenshottr --selector="#hero" [label]         Screenshot specific element
  screenshottr [url] --reference [label]          Reference mode (1920px)

Options:
  --selector=SEL    CSS selector to capture a specific element
  --reference, -r   Reference mode: 1920x1080, saves to ./references/
  --width=N         Override viewport width
  --out=DIR         Custom output directory
  --wait=MS         Extra milliseconds to wait after page load
  --wait-for=SEL    Wait for a CSS selector to appear before capture
  --scroll          Scroll page first to trigger lazy-loaded content
  --help, -h        Show this help

Examples:
  screenshottr                                    Capture localhost:3000
  screenshottr hero-v1                            Full page with label
  screenshottr --selector="#hero" hero             Hero section only
  screenshottr /services                          Capture localhost:3000/services
  screenshottr https://example.com --reference    Reference screenshot
  screenshottr https://example.com --scroll       Scroll to load lazy images
`);
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  console.log(`📸 Capturing: ${options.url}`);
  if (options.selector) console.log(`   Selector: ${options.selector}`);
  if (options.mode === "reference")
    console.log(`   Mode: reference (1920px)`);
  if (options.widthOverride)
    console.log(`   Width override: ${options.widthOverride}px`);
  if (options.scrollPage)
    console.log(`   Scrolling page to load lazy content...`);
  if (options.waitForSelector)
    console.log(`   Waiting for: ${options.waitForSelector}`);
  if (options.extraWait) console.log(`   Extra wait: ${options.extraWait}ms`);

  try {
    const result = await screenshot(options);
    console.log(`✅ Saved: ${result.filepath}`);
  } catch (err: any) {
    console.error(`❌ Screenshot failed: ${err.message}`);
    process.exit(1);
  }
}

main();
