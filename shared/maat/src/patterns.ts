// ═══════════════════════════════════════════════════════════════════════════════
// Ma'at's Scale - Field Classification Patterns
// "Ma'at weighs each field to determine its true purpose"
// ═══════════════════════════════════════════════════════════════════════════════

import type { FieldPattern, FieldType } from './types.js';

/**
 * Field classification patterns
 * Used to identify what type of data a form field expects
 */
export const FIELD_PATTERNS: Record<FieldType, FieldPattern> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONAL INFO
  // ═══════════════════════════════════════════════════════════════════════════

  fullName: {
    fieldType: 'fullName',
    selectors: [
      '[name*="full_name" i]',
      '[name*="fullname" i]',
      '[id*="full_name" i]',
      '[data-testid*="full" i][data-testid*="name" i]',
    ],
    labelPatterns: [
      /^full\s*name$/i,
      /^your\s*name$/i,
      /^complete\s*name$/i,
      /^legal\s*name$/i,
    ],
    namePatterns: [/full.*name/i, /fullname/i],
    ariaPatterns: [/full.*name/i],
    placeholderPatterns: [/enter.*full.*name/i],
  },

  firstName: {
    fieldType: 'firstName',
    selectors: [
      '[name*="first_name" i]',
      '[name*="firstname" i]',
      '[name*="given_name" i]',
      '[id*="first_name" i]',
      '[data-testid*="first" i][data-testid*="name" i]',
    ],
    labelPatterns: [/^first\s*name$/i, /^given\s*name$/i, /^forename$/i],
    namePatterns: [/first.*name/i, /firstname/i, /given.*name/i],
    ariaPatterns: [/first.*name/i],
    placeholderPatterns: [/first\s*name/i],
  },

  lastName: {
    fieldType: 'lastName',
    selectors: [
      '[name*="last_name" i]',
      '[name*="lastname" i]',
      '[name*="family_name" i]',
      '[name*="surname" i]',
      '[id*="last_name" i]',
    ],
    labelPatterns: [/^last\s*name$/i, /^family\s*name$/i, /^surname$/i],
    namePatterns: [/last.*name/i, /lastname/i, /family.*name/i, /surname/i],
    ariaPatterns: [/last.*name/i],
    placeholderPatterns: [/last\s*name/i],
  },

  email: {
    fieldType: 'email',
    selectors: [
      'input[type="email"]',
      '[name*="email" i]',
      '[id*="email" i]',
      '[data-testid*="email" i]',
    ],
    labelPatterns: [/^email$/i, /^e-?mail$/i, /^email\s*address$/i],
    namePatterns: [/email/i],
    ariaPatterns: [/email/i],
    placeholderPatterns: [/email/i, /@/],
  },

  phone: {
    fieldType: 'phone',
    selectors: [
      'input[type="tel"]',
      '[name*="phone" i]',
      '[name*="mobile" i]',
      '[name*="telephone" i]',
      '[id*="phone" i]',
    ],
    labelPatterns: [
      /^phone$/i,
      /^mobile$/i,
      /^telephone$/i,
      /^phone\s*number$/i,
      /^mobile\s*number$/i,
    ],
    namePatterns: [/phone/i, /mobile/i, /telephone/i],
    ariaPatterns: [/phone/i, /mobile/i],
    placeholderPatterns: [/\d{3}[-.]?\d{3}[-.]?\d{4}/],
  },

  city: {
    fieldType: 'city',
    selectors: [
      '[name*="city" i]',
      '[name*="city_of_residence" i]',
      '[id*="city" i]',
    ],
    labelPatterns: [/^city$/i, /^city\s*of\s*residence$/i],
    namePatterns: [/city/i],
    ariaPatterns: [/city/i],
    placeholderPatterns: [/city/i],
  },

  state: {
    fieldType: 'state',
    selectors: [
      '[name*="state" i]',
      '[name*="region" i]',
      '[name*="province" i]',
      '[id*="state" i]',
    ],
    labelPatterns: [/^state$/i, /^region$/i, /^province$/i, /^state\s*\/?\s*province$/i],
    namePatterns: [/state/i, /region/i, /province/i],
    ariaPatterns: [/state/i],
    placeholderPatterns: [/state/i],
  },

  zipCode: {
    fieldType: 'zipCode',
    selectors: [
      '[name*="zip" i]',
      '[name*="postal" i]',
      '[name*="postcode" i]',
      '[id*="zip" i]',
    ],
    labelPatterns: [/^zip$/i, /^postal\s*code$/i, /^post\s*code$/i, /^zip\s*code$/i],
    namePatterns: [/zip/i, /postal/i, /postcode/i],
    ariaPatterns: [/zip/i, /postal/i],
    placeholderPatterns: [/\d{5}(-\d{4})?/],
  },

  country: {
    fieldType: 'country',
    selectors: [
      '[name*="country" i]',
      '[id*="country" i]',
      'select[name*="country" i]',
    ],
    labelPatterns: [/^country$/i, /^country\s*of\s*residence$/i],
    namePatterns: [/country/i],
    ariaPatterns: [/country/i],
    placeholderPatterns: [/country/i],
  },

  linkedIn: {
    fieldType: 'linkedIn',
    selectors: [
      '[name*="linkedin" i]',
      '[name*="linked_in" i]',
      '[placeholder*="linkedin" i]',
    ],
    labelPatterns: [/^linkedin$/i, /^linkedin\s*profile$/i, /^linkedin\s*url$/i],
    namePatterns: [/linkedin/i],
    ariaPatterns: [/linkedin/i],
    placeholderPatterns: [/linkedin\.com/i],
  },

  website: {
    fieldType: 'website',
    selectors: [
      '[name*="website" i]',
      '[name*="portfolio" i]',
      '[name*="url" i]',
      '[placeholder*="website" i]',
    ],
    labelPatterns: [/^website$/i, /^portfolio$/i, /^personal\s*website$/i],
    namePatterns: [/website/i, /portfolio/i, /personal.*url/i],
    ariaPatterns: [/website/i, /portfolio/i],
    placeholderPatterns: [/https?:\/\//],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPERIENCE
  // ═══════════════════════════════════════════════════════════════════════════

  company: {
    fieldType: 'company',
    selectors: [
      '[name*="company" i]',
      '[name*="employer" i]',
      '[name*="organization" i]',
    ],
    labelPatterns: [/^company$/i, /^employer$/i, /^organization$/i, /^current\s*company$/i],
    namePatterns: [/company/i, /employer/i, /organization/i],
    ariaPatterns: [/company/i, /employer/i],
    placeholderPatterns: [/company/i],
  },

  jobTitle: {
    fieldType: 'jobTitle',
    selectors: [
      '[name*="title" i]',
      '[name*="position" i]',
      '[name*="role" i]',
    ],
    labelPatterns: [
      /^job\s*title$/i,
      /^title$/i,
      /^position$/i,
      /^role$/i,
      /^current\s*title$/i,
    ],
    namePatterns: [/title/i, /position/i, /role/i],
    ariaPatterns: [/job.*title/i, /position/i],
    placeholderPatterns: [/title/i, /position/i],
  },

  startDate: {
    fieldType: 'startDate',
    selectors: [
      '[name*="start_date" i]',
      '[name*="startdate" i]',
      '[name*="from" i]',
      'input[type="month"][name*="start" i]',
    ],
    labelPatterns: [
      /^start\s*date$/i,
      /^start\s*month$/i,
      /^from$/i,
      /^start\s*month\s*\/\s*year$/i,
    ],
    namePatterns: [/start.*date/i, /startdate/i, /from\s*date/i],
    ariaPatterns: [/start.*date/i],
    placeholderPatterns: [/mm\/yyyy/i, /\d{4}-\d{2}/],
  },

  endDate: {
    fieldType: 'endDate',
    selectors: [
      '[name*="end_date" i]',
      '[name*="enddate" i]',
      '[name*="to" i]',
      'input[type="month"][name*="end" i]',
    ],
    labelPatterns: [/^end\s*date$/i, /^end\s*month$/i, /^to$/i, /^end\s*month\s*\/\s*year$/i],
    namePatterns: [/end.*date/i, /enddate/i, /to.*date/i],
    ariaPatterns: [/end.*date/i],
    placeholderPatterns: [/mm\/yyyy/i, /\d{4}-\d{2}/, /present/i],
  },

  current: {
    fieldType: 'current',
    selectors: [
      '[name*="current" i]',
      '[name*="still_work_here" i]',
      'input[type="checkbox"][name*="current" i]',
    ],
    labelPatterns: [
      /^i\s*currently\s*work\s*here$/i,
      /^current\s*position$/i,
      /^still\s*employed$/i,
      /^i\s*am\s*currently\s*in\s*this\s*role$/i,
    ],
    namePatterns: [/current/i, /present/i, /still.*work/i],
    ariaPatterns: [/current/i],
    placeholderPatterns: [],
  },

  jobDescription: {
    fieldType: 'jobDescription',
    selectors: [
      '[name*="description" i]',
      '[name*="summary" i]',
      'textarea[name*="job" i][name*="description" i]',
    ],
    labelPatterns: [
      /^job\s*description$/i,
      /^description$/i,
      /^responsibilities$/i,
      /^summary$/i,
    ],
    namePatterns: [/description/i, /summary/i, /responsibilities/i],
    ariaPatterns: [/description/i, /summary/i],
    placeholderPatterns: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EDUCATION
  // ═══════════════════════════════════════════════════════════════════════════

  school: {
    fieldType: 'school',
    selectors: [
      '[name*="school" i]',
      '[name*="university" i]',
      '[name*="college" i]',
      '[name*="institution" i]',
    ],
    labelPatterns: [
      /^school$/i,
      /^university$/i,
      /^college$/i,
      /^institution$/i,
      /^school\s*name$/i,
    ],
    namePatterns: [/school/i, /university/i, /college/i, /institution/i],
    ariaPatterns: [/school/i, /university/i],
    placeholderPatterns: [/school/i, /university/i],
  },

  degree: {
    fieldType: 'degree',
    selectors: [
      '[name*="degree" i]',
      '[name*="degree_type" i]',
      'select[name*="degree" i]',
    ],
    labelPatterns: [/^degree$/i, /^degree\s*type$/i, /^level\s*of\s*education$/i],
    namePatterns: [/degree/i],
    ariaPatterns: [/degree/i],
    placeholderPatterns: [/bachelor'?s?,? master'?s?,? doctoral/i],
  },

  fieldOfStudy: {
    fieldType: 'fieldOfStudy',
    selectors: [
      '[name*="field" i]',
      '[name*="major" i]',
      '[name*="area_of_study" i]',
      '[name*="concentration" i]',
    ],
    labelPatterns: [
      /^field\s*of\s*study$/i,
      /^major$/i,
      /^area\s*of\s*study$/i,
      /^concentration$/i,
      /^field$/i,
    ],
    namePatterns: [/field/i, /major/i, /area.*study/i, /concentration/i],
    ariaPatterns: [/field.*study/i, /major/i],
    placeholderPatterns: [],
  },

  graduationDate: {
    fieldType: 'graduationDate',
    selectors: [
      '[name*="graduation_date" i]',
      '[name*="graduation" i]',
      '[name*="grad_date" i]',
      'input[type="month"][name*="grad" i]',
    ],
    labelPatterns: [
      /^graduation\s*date$/i,
      /^date\s*of\s*graduation$/i,
      /^graduation\s*month$/i,
    ],
    namePatterns: [/graduation.*date/i, /grad.*date/i, /graduated/i],
    ariaPatterns: [/graduation/i],
    placeholderPatterns: [/mm\/yyyy/i, /\d{4}/],
  },

  gpa: {
    fieldType: 'gpa',
    selectors: [
      '[name*="gpa" i]',
      '[name*="grade_point" i]',
      '[placeholder*="gpa" i]',
    ],
    labelPatterns: [/^gpa$/i, /^grade\s*point\s*average$/i],
    namePatterns: [/gpa/i, /grade.*point/i],
    ariaPatterns: [/gpa/i],
    placeholderPatterns: [/[0-4]\.\d{2}/],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL
  // ═══════════════════════════════════════════════════════════════════════════

  coverLetter: {
    fieldType: 'coverLetter',
    selectors: [
      '[name*="cover_letter" i]',
      '[name*="coverletter" i]',
      'textarea[name*="cover" i][name*="letter" i]',
    ],
    labelPatterns: [
      /^cover\s*letter$/i,
      /^cover\s*letter\s*\(optional\)$/i,
      /^why\s*do\s*you\s*want\s*to\s*work\s*here/i,
    ],
    namePatterns: [/cover.*letter/i],
    ariaPatterns: [/cover.*letter/i],
    placeholderPatterns: [],
  },

  resumeUpload: {
    fieldType: 'resumeUpload',
    selectors: [
      'input[type="file"]',
      'input[accept*="resume" i]',
      'input[accept*=".pdf" i]',
      '[name*="resume" i][type="file"]',
      '[name*="cv" i][type="file"]',
    ],
    labelPatterns: [/^resume$/i, /^resume\/cv$/i, /^upload\s*resume$/i, /^attach\s*resume$/i],
    namePatterns: [/resume/i, /cv/i],
    ariaPatterns: [/resume/i, /upload/i],
    placeholderPatterns: [],
  },

  salaryExpectations: {
    fieldType: 'salaryExpectations',
    selectors: [
      '[name*="salary" i]',
      '[name*="compensation" i]',
      '[name*="expected_salary" i]',
    ],
    labelPatterns: [
      /^salary\s*expectations?$/i,
      /^expected\s*salary$/i,
      /^salary\s*requirements?$/i,
      /^desired\s*compensation$/i,
    ],
    namePatterns: [/salary/i, /compensation/i],
    ariaPatterns: [/salary/i, /compensation/i],
    placeholderPatterns: [/\$[\d,]+/i],
  },

  availability: {
    fieldType: 'availability',
    selectors: [
      '[name*="availability" i]',
      '[name*="start_date" i]',
      '[name*="available" i]',
    ],
    labelPatterns: [
      /^availability$/i,
      /^when\s*can\s*you\s*start$/i,
      /^start\s*date$/i,
      /^available\s*to\s*start$/i,
    ],
    namePatterns: [/availability/i, /start.*date/i],
    ariaPatterns: [/availability/i],
    placeholderPatterns: [],
  },

  authorizedToWork: {
    fieldType: 'authorizedToWork',
    selectors: [
      '[name*="authorized" i]',
      '[name*="legal" i][name*="work" i]',
      'select[name*="authorized" i]',
    ],
    labelPatterns: [
      /^are\s*you\s*authorized\s*to\s*work/i,
      /^legally\s*authorized\s*to\s*work/i,
      /^work\s*authorization$/i,
    ],
    namePatterns: [/authorized/i, /legal.*work/i],
    ariaPatterns: [/authorized/i],
    placeholderPatterns: [],
  },

  visaSponsorship: {
    fieldType: 'visaSponsorship',
    selectors: [
      '[name*="visa" i]',
      '[name*="sponsorship" i]',
      '[name*="require_sponsorship" i]',
    ],
    labelPatterns: [
      /^will\s*you\s*require\s*visa\s*sponsorship/i,
      /^do\s*you\s*need\s*sponsorship/i,
      /^visa\s*status$/i,
    ],
    namePatterns: [/visa/i, /sponsorship/i],
    ariaPatterns: [/visa/i, /sponsorship/i],
    placeholderPatterns: [],
  },

  referralSource: {
    fieldType: 'referralSource',
    selectors: [
      '[name*="referral" i]',
      '[name*="source" i]',
      '[name*="how_did_you_hear" i]',
      'select[name*="referral" i]',
    ],
    labelPatterns: [
      /^how\s*did\s*you\s*hear\s*about\s*us/i,
      /^referral\s*source$/i,
      /^how\s*did\s*you\s*find\s*this\s*job/i,
      /^source$/i,
    ],
    namePatterns: [/referral/i, /source/i, /how.*hear/i],
    ariaPatterns: [/referral/i, /source/i],
    placeholderPatterns: [],
  },

  unknown: {
    fieldType: 'unknown',
    selectors: [],
    labelPatterns: [],
    namePatterns: [],
    ariaPatterns: [],
    placeholderPatterns: [],
  },
};

/**
 * Get field pattern for a specific field type
 */
export function getPattern(fieldType: FieldType): FieldPattern {
  return FIELD_PATTERNS[fieldType] || FIELD_PATTERNS.unknown;
}

/**
 * Get all field patterns
 */
export function getAllPatterns(): Record<FieldType, FieldPattern> {
  return FIELD_PATTERNS;
}
