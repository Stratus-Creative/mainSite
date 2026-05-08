/**
 * Site-wide settings that change occasionally.
 * Update these manually as state changes — they appear in production immediately on deploy.
 */

export const SITE_SETTINGS = {
  /**
   * How many Custom engagement slots Stratus is currently accepting.
   * Set to null to hide the scarcity badge entirely.
   * NEVER fake this — only show real numbers.
   */
  customSlotsThisQuarter: 2 as number | null,

  /**
   * Response time promise displayed across the site.
   * Update if delivery shifts.
   */
  responsePromise: "Reply within 4 hours during business hours",

  /**
   * Set to a Microsoft Clarity project ID once you've signed up.
   * Free at clarity.microsoft.com — gives you heatmaps + session replay.
   */
  clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? null,

  /**
   * Whether to show the founder video on home + about.
   * Flip on once you've recorded the 90-second loom.
   */
  showFounderVideo: false,

  /**
   * Path to the founder photo (relative to /public).
   * Set to null to show the placeholder instead.
   */
  founderPhoto: "/Founder.jpg" as string | null,
};
