// ═══════════════════════════════════════════════════════════════════════════════
// Wadjet's Gaze - ATS Platform Registry
// "The All-Seeing Eye watches and identifies every ATS platform"
// ═══════════════════════════════════════════════════════════════════════════════

export interface AtsPlatform {
  id: string;
  name: string;
  domainPatterns: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
}

export const ATS_PLATFORMS: readonly AtsPlatform[] = [
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    domainPatterns: ['boards.greenhouse.io', 'job-boards.greenhouse.io'],
    difficulty: 'medium',
    notes: 'Two versions - old boards vs new job-boards',
  },
  {
    id: 'workday',
    name: 'Workday',
    domainPatterns: ['myworkdayjobs.com', 'wd5.myworkday.com', 'workday.com'],
    difficulty: 'hard',
    notes: 'React-based, controlled inputs, most common enterprise ATS (~18% market share)',
  },
  {
    id: 'lever',
    name: 'Lever',
    domainPatterns: ['jobs.lever.co'],
    difficulty: 'medium',
    notes: 'Clean forms, reasonable DOM structure (~8% market share)',
  },
  {
    id: 'icims',
    name: 'iCIMS',
    domainPatterns: ['icims.com', 'icims.us'],
    difficulty: 'hard',
    notes: 'Legacy interface, complex iframe usage (~11% market share)',
  },
  {
    id: 'taleo',
    name: 'Taleo (Oracle)',
    domainPatterns: ['taleo.net'],
    difficulty: 'hard',
    notes: 'Older technology, heavy iframe usage (~9% market share)',
  },
  {
    id: 'adp',
    name: 'ADP Workforce',
    domainPatterns: ['workforcenow.adp.com'],
    difficulty: 'medium',
    notes: 'Common for SMBs (~7% market share)',
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    domainPatterns: ['bamboohr.com', 'bamboohr.co.uk'],
    difficulty: 'easy',
    notes: 'Simple forms, good labeling (~5% market share)',
  },
  {
    id: 'ashby',
    name: 'Ashby',
    domainPatterns: ['ashbyhq.com'],
    difficulty: 'easy',
    notes: 'Modern, clean DOM (~4% market share, growing fast in tech)',
  },
  {
    id: 'smartrecruiters',
    name: 'SmartRecruiters',
    domainPatterns: ['smartrecruiters.com'],
    difficulty: 'medium',
    notes: 'Used by large enterprises (~5% market share)',
  },
  {
    id: 'paylocity',
    name: 'Paylocity',
    domainPatterns: ['recruiting.paylocity.com'],
    difficulty: 'medium',
    notes: 'Common in mid-market (~4% market share)',
  },
  {
    id: 'jobvite',
    name: 'Jobvite',
    domainPatterns: ['jobvite.com'],
    difficulty: 'medium',
    notes: 'Moderate complexity (~3% market share)',
  },
  {
    id: 'jazzhr',
    name: 'JazzHR',
    domainPatterns: ['applytojob.com'],
    difficulty: 'easy',
    notes: 'Simple SMB-focused ATS (~3% market share)',
  },
  {
    id: 'uknown',
    name: 'Unknown ATS',
    domainPatterns: [],
    difficulty: 'medium',
    notes: 'Generic fallback for unknown platforms',
  },
] as const;

export type AtsPlatformId = (typeof ATS_PLATFORMS)[number]['id'];

export function getPlatformById(id: string): AtsPlatform | undefined {
  return ATS_PLATFORMS.find((p) => p.id === id);
}

export function getPlatformByDomain(domain: string): AtsPlatform | undefined {
  const normalizedDomain = domain.toLowerCase();
  for (const platform of ATS_PLATFORMS) {
    for (const pattern of platform.domainPatterns) {
      if (normalizedDomain.includes(pattern.toLowerCase())) {
        return platform;
      }
    }
  }
  return undefined;
}

export function getAllPlatforms(): readonly AtsPlatform[] {
  return ATS_PLATFORMS;
}
