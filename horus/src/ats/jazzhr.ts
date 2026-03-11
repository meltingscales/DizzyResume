/// JazzHR adapter (*.applytojob.com).
///
/// Quirks handled:
/// - EEO section — skip gender, race, ethnicity, veteran, disability.
/// - "How did you hear about this job?" / referral source — skip.
/// - JazzHR uses straightforward HTML forms with visible labels, so the
///   generic classifier handles most fields well.
/// - Submit button is typically "Apply for this Job" or "Submit Application".

import type { AtsAdapter } from './adapter';

const SKIP_LABELS = /how.*(hear|find|learn|know).*(us|role|job|position)|referral|source\b|gender|sex\b|race|ethnicity|veteran|military|disability|self.?identif/i;

export const jazzhrAdapter: AtsAdapter = {
  id: 'jazzhr',

  shouldSkip(_el, label) {
    return SKIP_LABELS.test(label);
  },

  isSubmitButton(el) {
    const text = el.textContent?.trim() ?? '';
    return /apply (for this job|now)|submit application|^apply$/i.test(text);
  },
};
