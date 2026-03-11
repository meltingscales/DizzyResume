/// Workday adapter (*.myworkdayjobs.com, wd*.myworkdayjobs.com).
///
/// Workday is the most common enterprise ATS (~18% market share). Its forms
/// are React-controlled — handled generically by nativeInputSetter. ARIA
/// listbox dropdowns (state, country) are handled by fillAriaListbox. Multi-
/// step URL navigation is handled by watchForSubmission's MutationObserver.
///
/// What this adapter adds on top:
///
/// 1. shouldSkip — suppress fields the user must fill deliberately:
///    · Phone Device Type (Home / Mobile / Work dropdown)
///    · Country dialing-code prefix on phone fields
///    · Legal authorization & sponsorship questions
///    · EEO/demographic section (gender, ethnicity, veteran, disability)
///    · "How did you hear about us?" source dropdowns
///    · Preferred pronoun
///
/// 2. isSubmitButton — Workday multi-step forms have "Save and Continue"
///    buttons that navigate between steps. These must NOT arm the
///    application logger. Only the final "Apply" / "Submit" buttons should.
///    The adapter takes full ownership of submit detection for Workday,
///    returning an explicit false for step-navigation labels.

import type { AtsAdapter } from './adapter';

// ── Fields to skip ────────────────────────────────────────────────────────────

const SKIP_LABEL = new RegExp(
  [
    'phone\\s*(device\\s*)?type',       // "Phone Device Type" dropdown
    'country\\s*(phone|dialing)\\s*code', // phone country prefix select
    'dialing\\s*code',
    'legally\\s*authorized',             // "Are you legally authorized to work…"
    'require\\s*sponsorship',            // "Will you require visa sponsorship…"
    'will\\s+you\\s+now\\s+or',          // "Will you now or in the future…"
    'visa\\s*sponsorship',
    'pronouns?',                         // "Preferred Pronoun"
    '\\bgender\\b',
    'ethnicity',
    '\\brace\\b',
    'veteran',
    'disability',
    'individual\\s+with\\s+a\\s+disability',
    'self.?identif',
    'how\\s+(did|do)\\s+you\\s+(hear|find|know|learn)', // "How did you hear…"
    'source\\s+of\\s+hire',
    'referral\\s+source',
  ].join('|'),
  'i'
);

// ── Submit button detection ───────────────────────────────────────────────────

// These are Workday step-navigation labels — they must NOT arm the logger.
const STEP_NAV = /save\s+and\s+continue|next\s+step|\bnext\b|\bback\b|previous|cancel|save\s+for\s+later/i;

// These are final-submit labels that should arm the logger.
const FINAL_SUBMIT = /\bapply\b|^submit$|apply\s+now|review\s+application|complete\s+application|submit\s+application|finish\s+application/i;

// ── Adapter ───────────────────────────────────────────────────────────────────

export const workdayAdapter: AtsAdapter = {
  id: 'workday',

  shouldSkip(_el, label) {
    return SKIP_LABEL.test(label);
  },

  isSubmitButton(el) {
    // Prefer the visible text; fall back to value attribute on <input type="submit">
    const text =
      el.textContent?.trim() ??
      (el as HTMLInputElement).value?.trim() ??
      '';

    // Workday step-navigation buttons — explicitly NOT a final submit
    if (STEP_NAV.test(text)) return false;

    // Workday final-submit buttons — arm the application logger
    if (FINAL_SUBMIT.test(text)) return true;

    // Anything else on a Workday page is treated as non-submit (safe default).
    // The logger can always be triggered manually from Ra's tracker.
    return false;
  },
};
