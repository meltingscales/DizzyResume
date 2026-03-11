/// Ashby adapter (*.ashbyhq.com).
///
/// Quirks handled:
/// - EEO / diversity section — skip gender, race, ethnicity, veteran,
///   disability, and pronouns fields.
/// - "How did you hear about this role?" — Ashby uses this exact phrasing.
/// - LinkedIn / portfolio URL fields: Ashby uses `linkedin` and `website`
///   as field names in some variants; extraPatterns handles them.
/// - Ashby forms are mostly single-page, so submit detection is simple.
///   The button text is typically "Submit Application" or "Apply".

import type { AtsAdapter } from './adapter';

const SKIP_LABELS = /how.*(hear|find|learn|know).*(us|role|job|position)|referral|source\b|gender|sex\b|pronouns|race|ethnicity|veteran|military|disability|self.?identif/i;

export const ashbyAdapter: AtsAdapter = {
  id: 'ashby',

  extraPatterns: [
    {
      category: 'linkedin',
      patterns: [/^linkedin$/i, /linkedin[_\s-]?(url|profile|link)?/i],
    },
    {
      category: 'website',
      patterns: [/^(personal[_\s-]?)?website$/i, /portfolio[_\s-]?(url|link)?/i, /github[_\s-]?(url|link)?/i],
    },
  ],

  shouldSkip(_el, label) {
    return SKIP_LABELS.test(label);
  },

  isSubmitButton(el) {
    const text = el.textContent?.trim() ?? '';
    return /submit\s+application|^apply$|apply\s+now/i.test(text);
  },
};
