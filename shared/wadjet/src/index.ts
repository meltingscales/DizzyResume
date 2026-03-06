// ═══════════════════════════════════════════════════════════════════════════════
// Wadjet's Gaze - ATS Detection
// "The All-Seeing Eye watches and identifies every ATS platform"
// ═══════════════════════════════════════════════════════════════════════════════

export * from './platforms.js';
export * from './patterns.js';

import { getPlatformByDomain, type AtsPlatform } from './platforms.js';
import { detectAtsByDomPatterns } from './patterns.js';

/**
 * Detect the ATS platform from the current page
 * Uses both URL and DOM pattern matching for accuracy
 */
export function detectAtsPlatform(url: string, document?: Document): AtsPlatform | null {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // First, try domain matching
    const byDomain = getPlatformByDomain(domain);
    if (byDomain && byDomain.id !== 'unknown') {
      return byDomain;
    }

    // If we have a document, try DOM pattern detection
    if (document) {
      const byDom = detectAtsByDomPatterns(document);
      if (byDom) {
        return getPlatformByDomain(`${byDom}.com`) || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is a known ATS job posting page
 */
export function isJobPostingUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();

    // Common job posting path patterns
    const jobPathPatterns = [
      '/job',
      '/jobs',
      '/career',
      '/careers',
      '/opportunities',
      '/opening',
      '/openings',
      '/position',
      '/positions',
      '/role',
      '/roles',
      '/apply',
      '/application',
      '/posting',
      '/postings',
    ];

    return jobPathPatterns.some((pattern) => path.includes(pattern));
  } catch {
    return false;
  }
}

/**
 * Extract job ID from ATS URLs
 */
export function extractJobId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Common job ID patterns for different ATS
    const patterns = [
      /\/jobs\/(\d+)/, // Greenhouse: /jobs/12345
      /\/job\/(\d+)/, // Lever: /job/12345
      /\/job\/([^/]+)/, // Workday: /job/some-job-id
      /\/jobs\/([^/]+)/, // Generic: /jobs/some-job-id
      /postingId=(\d+)/, // Query param: ?postingId=12345
      /jobId=(\d+)/, // Query param: ?jobId=12345
      /rid=(\d+)/, // iCIMS: ?rid=12345
    ];

    for (const pattern of patterns) {
      const match = path.match(pattern) || urlObj.search.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}
