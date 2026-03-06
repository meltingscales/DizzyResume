// Wadjet's Gaze - ATS Platform Registry

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
    domainPatterns: ['myworkdayjobs.com', 'wd5.myworkday.com'],
    difficulty: 'hard',
    notes: 'React-based, controlled inputs, ~18% market share',
  },
  {
    id: 'lever',
    name: 'Lever',
    domainPatterns: ['jobs.lever.co'],
    difficulty: 'medium',
    notes: 'Clean forms, ~8% market share',
  },
  {
    id: 'icims',
    name: 'iCIMS',
    domainPatterns: ['icims.com'],
    difficulty: 'hard',
    notes: 'Legacy interface, ~11% market share',
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    domainPatterns: ['bamboohr.com'],
    difficulty: 'easy',
    notes: 'Simple forms, ~5% market share',
  },
  {
    id: 'unknown',
    name: 'Unknown ATS',
    domainPatterns: [],
    difficulty: 'medium',
  },
] as const;

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
