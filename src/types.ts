export interface ScreenshotOptions {
  /** URL to capture. Defaults to http://localhost:3000 */
  url?: string;
  /** CSS selector to capture a specific element instead of full page */
  selector?: string;
  /** Label appended to the filename */
  label?: string;
  /** Capture mode — "default" (1440x900) or "reference" (1920x1080) */
  mode?: "default" | "reference";
  /** Additional milliseconds to wait after page load */
  extraWait?: number;
  /** Wait for this CSS selector to appear before capturing */
  waitForSelector?: string;
  /** Scroll the page first to trigger lazy-loaded content */
  scrollPage?: boolean;
  /** Override viewport width (keeps mode's height) */
  widthOverride?: number | null;
  /** Output directory. Defaults to mode's directory (./screenshots or ./references) */
  outDir?: string;
}

export interface ModeConfig {
  dir: string;
  viewport: { width: number; height: number };
  timeout: number;
}

export interface ScreenshotResult {
  filepath: string;
  filename: string;
  width: number;
  height: number;
  selector?: string;
  url: string;
}
