/// BambooHR adapter (*.bamboohr.com/careers).
///
/// Quirks handled:
/// - "How did you hear about us?" / referral source dropdowns — skip them.
/// - "Desired salary" — skip (profile doesn't store a target salary).
/// - Submit button: <button>Apply</button> or <button>Submit Application</button>.

import type { AtsAdapter } from './adapter';

const SKIP_PATTERN = /how (did you|do you).*(hear|find|learn)|referral source|desired salary/i;

export const bamboohrAdapter: AtsAdapter = {
  id: 'bamboohr',

  shouldSkip(_el, label) {
    return SKIP_PATTERN.test(label);
  },

  isSubmitButton(el) {
    const text = el.textContent?.trim() ?? '';
    return /^apply$|submit application/i.test(text);
  },
};
