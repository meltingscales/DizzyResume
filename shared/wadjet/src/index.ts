// Wadjet's Gaze - ATS Detection

export * from './platforms.js';
export * from './patterns.js';

import { getPlatformByDomain, type AtsPlatform } from './platforms.js';
import { detectAtsByDomPatterns } from './patterns.js';

export function detectAtsPlatform(url: string, document?: Document): AtsPlatform | null {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    const byDomain = getPlatformByDomain(domain);
    if (byDomain && byDomain.id !== 'unknown') {
      return byDomain;
    }

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

export function isJobPostingUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();
    const jobPathPatterns = ['/job', '/jobs', '/career', '/apply'];
    return jobPathPatterns.some((pattern) => path.includes(pattern));
  } catch {
    return false;
  }
}

export function extractJobId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const patterns = [
      /\/jobs\/(\d+)/,
      /\/job\/(\d+)/,
      /jobId=(\d+)/,
    ];
    for (const pattern of patterns) {
      const match = path.match(pattern) || urlObj.search.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}
