/// SmartRecruiters adapter (*.smartrecruiters.com).
///
/// Quirks handled:
/// - EEO / self-identification section at the bottom — skip race, gender,
///   ethnicity, veteran status, disability, pronouns.
/// - "How did you hear about us?" / source-of-hire dropdown — skip.
/// - Multi-step: "Next" / "Back" are navigation; final submit is
///   "Submit Application" or "Apply".
/// - LinkedIn URL input name is often `linkedIn` or `linkedInUrl`.

import type { AtsAdapter } from './adapter';

const SKIP_LABELS = /how.*(hear|find|learn|know).*(us|role|job|position)|referral source|source of hire|where did you (hear|find|learn)|race|ethnicity|gender|sex\b|veteran|military|disability|pronouns|self.?identif/i;

const STEP_NAV = /^\s*(next|back|previous|cancel|save( (and|&) continue)?)\s*$/i;
const FINAL_SUBMIT = /submit\s+application|^apply$|apply\s+now|complete\s+application/i;

export const smartrecruitersAdapter: AtsAdapter = {
  id: 'smartrecruiters',

  extraPatterns: [
    {
      category: 'linkedin',
      patterns: [/linkedIn(Url)?/i],
    },
    {
      category: 'website',
      patterns: [/portfolioUrl|personalWebsite|websiteUrl/i],
    },
  ],

  shouldSkip(_el, label) {
    return SKIP_LABELS.test(label);
  },

  isSubmitButton(el) {
    const text = el.textContent?.trim() ?? '';
    if (STEP_NAV.test(text)) return false;
    if (FINAL_SUBMIT.test(text)) return true;
    return false;
  },
};
