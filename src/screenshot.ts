import puppeteer from "puppeteer";
import { mkdir, readdir } from "fs/promises";
import { join } from "path";
import { MODES, DEFAULT_URL } from "./config";
import type { ScreenshotOptions, ScreenshotResult } from "./types";

/**
 * Scroll the page to trigger lazy-loaded content, then scroll back to top.
 */
async function autoScroll(page: any): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * Get the next auto-incremented screenshot number for a directory.
 */
async function getNextScreenshotNumber(dir: string): Promise<number> {
  try {
    const files = await readdir(dir);
    const numbers = files
      .filter((f) => f.startsWith("screenshot-") && f.endsWith(".png"))
      .map((f) => {
        const match = f.match(/screenshot-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  } catch {
    return 1;
  }
}

/**
 * Sanitize a selector string for use in a filename.
 */
function selectorToFilename(selector: string): string {
  return selector
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
}

/**
 * Capture a screenshot of a web page or a specific element.
 */
export async function screenshot(
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const {
    url = DEFAULT_URL,
    selector = null,
    label = "",
    mode = "default",
    extraWait = 0,
    waitForSelector = null,
    scrollPage = false,
    widthOverride = null,
    outDir,
  } = options;

  const config = MODES[mode];
  if (!config) {
    throw new Error(`Unknown mode: ${mode}. Use "default" or "reference".`);
  }

  const dir = outDir || config.dir;

  // Ensure output directory exists
  await mkdir(dir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const viewport = widthOverride
      ? { width: widthOverride, height: config.viewport.height }
      : config.viewport;
    await page.setViewport(viewport);

    // Navigate and wait for network to be idle
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: config.timeout,
    });

    // Scroll page to trigger lazy loading
    if (scrollPage) {
      await autoScroll(page);
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Wait for specific element if requested
    if (waitForSelector) {
      try {
        await page.waitForSelector(waitForSelector, { timeout: 10000 });
      } catch {
        console.warn(
          `⚠️  Element "${waitForSelector}" not found within 10s, continuing anyway...`
        );
      }
    }

    // Base wait for animations (longer for external sites)
    const baseWait = mode === "reference" ? 1000 : 500;
    await new Promise((r) => setTimeout(r, baseWait + extraWait));

    // Generate filename
    const num = await getNextScreenshotNumber(dir);
    const parts: (string | number)[] = ["screenshot", num];
    if (selector) {
      parts.push(selectorToFilename(selector));
    }
    if (label) {
      parts.push(label);
    }
    const filename = `${parts.join("-")}.png`;
    const filepath = join(dir, filename);

    if (selector) {
      // Screenshot specific element
      const element = await page.$(selector);
      if (!element) {
        // Gather available sections for a helpful error
        const sections = await page.$$eval("main > *", (els: Element[]) =>
          els
            .map(
              (el, i) =>
                `  ${i + 1}. <${el.tagName.toLowerCase()}>${el.className ? " ." + el.className.split(" ")[0] : ""}${el.id ? " #" + el.id : ""}`
            )
            .join("\n")
        );
        throw new Error(
          `Element not found: ${selector}\n\nAvailable sections in <main>:\n${sections || "  (none found)"}`
        );
      }

      await element.screenshot({ path: filepath });
    } else {
      // Full page screenshot
      await page.screenshot({ path: filepath, fullPage: true });
    }

    return {
      filepath,
      filename,
      width: viewport.width,
      height: viewport.height,
      selector: selector || undefined,
      url,
    };
  } finally {
    await browser.close();
  }
}
