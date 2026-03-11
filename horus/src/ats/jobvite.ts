/// Jobvite adapter (*.jobvite.com).
///
/// Quirks handled:
/// - EEO / diversity section — skip gender, race, ethnicity, veteran,
///   disability, and related self-identification fields.
/// - "Source" / "How did you hear about us?" — skip.
/// - Work authorization / sponsorship fields — skip (user fills manually).
/// - LinkedIn URL field name is typically `LinkedInUrl` or `LinkedIn Profile`.
/// - Multi-step: "Next Step" / "Back" are navigation; "Submit Application"
///   is the final submit.

import type { AtsAdapter } from './adapter';

const SKIP_LABELS = /how.*(hear|find|learn|know).*(us|role|job|position)|referral|source\b|gender|sex\b|race|ethnicity|veteran|military|disability|self.?identif|work (authorization|permit)|require.*(sponsor|visa)|authorized to work/i;

const STEP_NAV = /^\s*(next(\s+step)?|back|previous|cancel)\s*$/i;
const FINAL_SUBMIT = /submit\s+application|^apply$|apply\s+now|complete\s+application/i;

export const jobviteAdapter: AtsAdapter = {
  id: 'jobvite',

  extraPatterns: [
    {
      category: 'linkedin',
      patterns: [/LinkedInUrl|LinkedIn\s+Profile|linkedin_url/i],
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
