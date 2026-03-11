/// Lever adapter (jobs.lever.co).
///
/// Quirks handled:
/// - URL inputs are named `urls[LinkedIn]`, `urls[Portfolio]`, `urls[GitHub]`,
///   `urls[Twitter]`, `urls[Other]` — extra patterns map LinkedIn and Portfolio
///   to our categories; Twitter/Other are skipped.
/// - Location field uses Google Places autocomplete. The generic fill sets the
///   text value, but the dropdown may open. afterFill dispatches Escape to close
///   it so the user isn't left with a dangling suggestion list.
/// - Submit button: <button type="submit">Submit application</button>.

import type { AtsAdapter } from './adapter';

export const leverAdapter: AtsAdapter = {
  id: 'lever',

  extraPatterns: [
    {
      category: 'linkedin',
      patterns: [/urls\[LinkedIn\]/i],
    },
    {
      category: 'website',
      patterns: [/urls\[Portfolio\]/i, /urls\[GitHub\]/i],
    },
  ],

  shouldSkip(el, label) {
    const name = el.getAttribute('name') ?? '';
    // Skip Twitter and catch-all "Other" URL slots — not in our profile data.
    if (/urls\[Twitter\]/i.test(name) || /urls\[Other\]/i.test(name)) return true;
    // Skip "How did you hear about us?" and similar.
    if (/how.*(hear|find|learn|know)|referral/i.test(label)) return true;
    return false;
  },

  async afterFill() {
    // Close any Google Places autocomplete that opened when we filled the
    // location field.
    const locationInput = document.querySelector<HTMLInputElement>(
      'input[name="location"], input[placeholder*="City" i], input[id*="location" i]'
    );
    if (locationInput) {
      locationInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, keyCode: 27 })
      );
      // Small delay then re-focus to a neutral element so the dropdown dismisses.
      await new Promise((r) => setTimeout(r, 100));
      locationInput.blur();
    }
  },

  isSubmitButton(el) {
    const text = el.textContent?.trim() ?? '';
    return /submit application/i.test(text);
  },
};
