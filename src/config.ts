import type { ModeConfig } from "./types";

export const DEFAULT_URL = "http://localhost:3000";

export const MODES: Record<string, ModeConfig> = {
  default: {
    dir: "./screenshots",
    viewport: { width: 1440, height: 900 },
    timeout: 30000,
  },
  reference: {
    dir: "./references",
    viewport: { width: 1920, height: 1080 },
    timeout: 60000,
  },
};
