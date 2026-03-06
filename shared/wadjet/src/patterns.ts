// ═══════════════════════════════════════════════════════════════════════════════
// Wadjet's Gaze - DOM Patterns for ATS Detection
// "The All-Seeing Eye recognizes the signs of each platform"
// ═══════════════════════════════════════════════════════════════════════════════

export interface DomSignature {
  // CSS selectors that uniquely identify this ATS
  uniqueSelectors: string[];

  // Meta tags, script sources, or other markers
  metaMarkers: string[];

  // Common form patterns used by this ATS
  formPatterns: {
    inputNamePatterns: string[];
    labelPatterns: string[];
    containerClasses: string[];
  };
}

export const ATS_DOM_SIGNATURES: Record<string, DomSignature> = {
  greenhouse: {
    uniqueSelectors: [
      'body[data-environment="production"][data-qa="jobApplication"]',
      '.application-form',
      '#header',
      'section[data-qa="job-description"]',
    ],
    metaMarkers: ['_ghcx', 'greenhouse', 'boards.greenhouse.io'],
    formPatterns: {
      inputNamePatterns: [
        'job_application',
        'candidate[first_name]',
        'candidate[last_name]',
        'candidate[email]',
        'candidate[phone]',
      ],
      labelPatterns: [
        '^First Name',
        '^Last Name',
        '^Email',
        '^Phone',
        '^Resume$',
        '^Cover Letter',
      ],
      containerClasses: ['application', 'question', 'field'],
    },
  },

  workday: {
    uniqueSelectors: [
      '[data-automation-id="careerSiteHeader"]',
      '.css-1aa5t3c',
      '[data-automation-id="compositeContainer"]',
      'div[data-automation-id="jobTitle"]',
    ],
    metaMarkers: ['workday', 'myworkdayjobs', 'WD-K'],
    formPatterns: {
      inputNamePatterns: [
        'data-automation-id',
        'input-',
        'textInput-',
        'composite-',
      ],
      labelPatterns: [
        '^First Name',
        '^Last Name',
        '^Email Address',
        '^Phone Number',
        '^Resume/CV',
      ],
      containerClasses: ['css-', 'workday', 'parabolic'],
    },
  },

  lever: {
    uniqueSelectors: [
      '.postings-list',
      '.posting-template',
      '[data-qa="btn-apply"]',
      '.application-form',
    ],
    metaMarkers: ['lever', 'jobs.lever.co', 'LEVER'],
    formPatterns: {
      inputNamePatterns: [
        'name',
        'email',
        'phone',
        'org',
        'urls[LinkedIn]',
        'urls[Portfolio]',
        'files[resume]',
      ],
      labelPatterns: [
        '^First name',
        '^Last name',
        '^Email',
        '^Phone',
        '^Resume',
        '^LinkedIn',
      ],
      containerClasses: ['application', 'template-style-input'],
    },
  },

  icims: {
    uniqueSelectors: [
      '.iCIMS_JobPage',
      '#iCIMS_JobPage',
      '.iCIMS_ContentWrapper',
      '[data-iCIMS-WT]',
    ],
    metaMarkers: ['icims', 'iCIMS', 'talentnetwork'],
    formPatterns: {
      inputNamePatterns: [
        'iCIMS_',
        'candidate_',
        'job_',
      ],
      labelPatterns: [
        '^First Name',
        '^Last Name',
        '^E-mail',
        '^Phone',
        '^Resume',
      ],
      containerClasses: ['iCIMS_', 'form-field', 'question'],
    },
  },

  taleo: {
    uniqueSelectors: [
      '.taleo',
      '#taleo',
      '[data-binding]',
      '.inputtext',
    ],
    metaMarkers: ['taleo', 'talentbrew', 'tbe'],
    formPatterns: {
      inputNamePatterns: [
        'candidate',
        'requisition',
        'textField',
      ],
      labelPatterns: [
        '^First Name',
        '^Last Name',
        '^Email',
        '^Phone',
        '^Resume',
      ],
      containerClasses: ['panel', 'field', 'input'],
    },
  },

  bamboohr: {
    uniqueSelectors: [
      '.BambooHR',
      '[data-bamboo-hr]',
      '.ApplicationForm',
    ],
    metaMarkers: ['bamboohr', 'bamboohr.com'],
    formPatterns: {
      inputNamePatterns: [
        'Candidate.',
        'Resume.',
      ],
      labelPatterns: [
        '^First Name',
        '^Last Name',
        '^Email',
        '^Phone',
        '^Resume',
      ],
      containerClasses: ['field', 'input', 'form-group'],
    },
  },

  ashby: {
    uniqueSelectors: [
      '[data-ashby]',
      '.ashby-apply-form',
      '#ashby-application-form',
    ],
    metaMarkers: ['ashbyhq', 'ashby'],
    formPatterns: {
      inputNamePatterns: [
        'first_name',
        'last_name',
        'email',
        'phone',
        'resume',
      ],
      labelPatterns: [
        '^First Name',
        '^Last Name',
        '^Email',
        '^Phone',
        '^Resume',
      ],
      containerClasses: ['ashby', 'field', 'input'],
    },
  },
};

export function detectAtsByDomPatterns(document: Document): string | null {
  // Check for unique selectors
  for (const [platformId, signature] of Object.entries(ATS_DOM_SIGNATURES)) {
    for (const selector of signature.uniqueSelectors) {
      try {
        if (document.querySelector(selector)) {
          return platformId;
        }
      } catch {
        // Invalid selector, skip
        continue;
      }
    }
  }

  // Check meta markers (scripts, meta tags, etc.)
  const scripts = document.querySelectorAll('script[src]');
  const metas = document.querySelectorAll('meta[name], meta[property]');

  for (const [platformId, signature] of Object.entries(ATS_DOM_SIGNATURES)) {
    // Check script sources
    for (const script of Array.from(scripts)) {
      const src = script.getAttribute('src')?.toLowerCase() || '';
      for (const marker of signature.metaMarkers) {
        if (src.includes(marker.toLowerCase())) {
          return platformId;
        }
      }
    }

    // Check meta tags
    for (const meta of Array.from(metas)) {
      const content = meta.getAttribute('content')?.toLowerCase() || '';
      const name = meta.getAttribute('name')?.toLowerCase() || '';
      const prop = meta.getAttribute('property')?.toLowerCase() || '';

      for (const marker of signature.metaMarkers) {
        if (
          content.includes(marker.toLowerCase()) ||
          name.includes(marker.toLowerCase()) ||
          prop.includes(marker.toLowerCase())
        ) {
          return platformId;
        }
      }
    }
  }

  return null;
}
