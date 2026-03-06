// Wadjet's Gaze - DOM Patterns for ATS Detection

export interface DomSignature {
  uniqueSelectors: string[];
  metaMarkers: string[];
}

export const ATS_DOM_SIGNATURES: Record<string, DomSignature> = {
  greenhouse: {
    uniqueSelectors: [
      'body[data-environment="production"][data-qa="jobApplication"]',
      '.application-form',
    ],
    metaMarkers: ['greenhouse', 'boards.greenhouse.io'],
  },
  workday: {
    uniqueSelectors: [
      '[data-automation-id="careerSiteHeader"]',
      'div[data-automation-id="jobTitle"]',
    ],
    metaMarkers: ['workday', 'myworkdayjobs'],
  },
  lever: {
    uniqueSelectors: [
      '.postings-list',
      '[data-qa="btn-apply"]',
    ],
    metaMarkers: ['lever', 'jobs.lever.co'],
  },
  icims: {
    uniqueSelectors: [
      '.iCIMS_JobPage',
      '#iCIMS_JobPage',
    ],
    metaMarkers: ['icims'],
  },
  bamboohr: {
    uniqueSelectors: [
      '.BambooHR',
    ],
    metaMarkers: ['bamboohr'],
  },
};

export function detectAtsByDomPatterns(document: Document): string | null {
  for (const [platformId, signature] of Object.entries(ATS_DOM_SIGNATURES)) {
    for (const selector of signature.uniqueSelectors) {
      try {
        if (document.querySelector(selector)) {
          return platformId;
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}
