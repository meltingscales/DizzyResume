/// Paylocity adapter (recruiting.paylocity.com).
///
/// Quirks handled:
/// - EEO / OFCCP compliance section — skip race, gender, ethnicity,
///   veteran status, disability.
/// - "How did you hear about this position?" / source field — skip.
/// - "Desired salary" / pay expectations — skip (we don't store a target).
/// - "Are you legally authorized…" / sponsorship — skip (user fills manually).
/// - Multi-step form: "Next" and "Previous" are page navigation, not submit.
///   Final submit is "Submit" or "Apply Now".

import type { AtsAdapter } from './adapter';

const SKIP_LABELS = /how.*(hear|find|know|learn).*(us|role|job|position)|referral|source of hire|desired (salary|pay|compensation)|salary expectation|pay expectation|are you (legally )?authorized|work (authorization|permit)|require.*(sponsor|visa)|race|ethnicity|gender|sex\b|veteran|military|disability|self.?identif/i;

const STEP_NAV = /^\s*(next|previous|back|cancel|save( (and|&) continue)?)\s*$/i;
const FINAL_SUBMIT = /^submit$|apply\s+now|submit\s+application|complete\s+application/i;

export const paylocityAdapter: AtsAdapter = {
  id: 'paylocity',

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
