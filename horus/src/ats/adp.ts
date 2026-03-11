/// ADP Workforce Now adapter (workforcenow.adp.com).
///
/// ADP Workforce Now is common in mid-market companies (~7% market share).
/// Forms use a mix of Angular-bound inputs and standard HTML — the generic
/// nativeInputSetter handles both by dispatching input/change/blur events.
/// Hash-based SPA routing is already handled by watchForSubmission.
///
/// What this adapter adds on top:
///
/// 1. shouldSkip — suppress fields the user must fill deliberately:
///    · Name suffix (Jr., Sr., III — not in profile data)
///    · Preferred name / nickname
///    · Phone type (Home / Mobile / Work dropdown)
///    · Age verification ("Are you at least 18…")
///    · Work authorization and visa sponsorship questions
///    · "Have you previously worked here?" / former employee flag
///    · Desired pay / salary / compensation expectations
///    · Shift preference and availability
///    · Work type preference (Full-time / Part-time / Contract)
///    · EEO/demographic section (gender, ethnicity, veteran, disability)
///    · "How did you hear about us?" source dropdowns
///
/// 2. isSubmitButton — distinguish step-nav from final-submit.
///    ADP step buttons: "Next", "Back", "Previous", "Save & Continue".
///    ADP final submit: "Submit", "Submit Application".

import type { AtsAdapter } from './adapter';

// ── Fields to skip ────────────────────────────────────────────────────────────

const SKIP_LABEL = new RegExp(
  [
    // Name fields we don't have data for
    '\\bsuffix\\b',                       // "Suffix" (Jr., Sr., III)
    'preferred\\s+name',                  // "Preferred Name"
    '\\bnickname\\b',

    // Phone type selector
    'phone\\s*type',                      // "Phone Type" (Home/Mobile/Work)
    'country\\s*(phone|dialing)\\s*code',
    'dialing\\s*code',

    // Age & authorization
    'at\\s+least\\s+18',                  // "Are you at least 18 years of age?"
    '\\b18\\s+years\\b',
    'legally\\s+authorized',
    'authorized\\s+to\\s+work',
    'work\\s+authorization',
    'require\\s+sponsorship',
    'visa\\s+sponsorship',

    // Former employee
    'previously\\s+(worked|employed)',
    'former\\s+employee',
    'previously\\s+applied',

    // Compensation & availability
    'desired\\s+(pay|salary|wage|compensation|rate)',
    'expected\\s+(pay|salary|wage|compensation)',
    'salary\\s+expectation',
    'available\\s+start\\s+date',
    'earliest.*start',
    'shift\\s+preference',
    'preferred\\s+shift',
    'work\\s+type\\s+preference',         // Full-time / Part-time / Contract
    'employment\\s+type\\s+preference',
    'hours\\s+per\\s+week',

    // EEO / demographic
    '\\bgender\\b',
    'ethnicity',
    '\\brace\\b',
    'veteran',
    'disability',
    'self.?identif',
    'pronouns?',

    // Source of hire
    'how\\s+(did|do)\\s+you\\s+(hear|find|know|learn)',
    'source\\s+of\\s+hire',
    'referral\\s+source',
  ].join('|'),
  'i'
);

// ── Submit button detection ───────────────────────────────────────────────────

const STEP_NAV =
  /\bnext\b|next\s+section|\bback\b|previous|save\s+&?\s*continue|save\s+and\s+continue|cancel/i;

const FINAL_SUBMIT = /^submit$|submit\s+application|finish\s+application/i;

// ── Adapter ───────────────────────────────────────────────────────────────────

export const adpAdapter: AtsAdapter = {
  id: 'adp',

  shouldSkip(_el, label) {
    return SKIP_LABEL.test(label);
  },

  isSubmitButton(el) {
    const text =
      el.textContent?.trim() ??
      (el as HTMLInputElement).value?.trim() ??
      '';

    if (STEP_NAV.test(text)) return false;
    if (FINAL_SUBMIT.test(text)) return true;

    // Safe default — ADP step buttons should never arm the logger.
    return false;
  },
};
