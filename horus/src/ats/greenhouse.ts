/// Greenhouse adapter (boards.greenhouse.io, job-boards.greenhouse.io).
///
/// Quirks handled:
/// - EEO demographic section: gender, race/ethnicity, veteran status, disability —
///   skip these entirely; the user should fill them deliberately.
/// - "Voluntary Self-Identification" subsection — same treatment.
/// - The resume/cover-letter file upload fields are detected but not auto-filled
///   (file upload automation is Phase 3).
/// - Submit button: <input type="submit"> with value "Submit Application".

import type { AtsAdapter } from './adapter';

const EEO_PATTERN =
  /race|ethnicity|gender|veteran|disability|self.?identif|demographic|pronouns/i;

export const greenhouseAdapter: AtsAdapter = {
  id: 'greenhouse',

  shouldSkip(el, label) {
    const name = el.getAttribute('name') ?? '';
    return EEO_PATTERN.test(label) || EEO_PATTERN.test(name) || EEO_PATTERN.test(el.id);
  },

  isSubmitButton(el) {
    const text =
      el.textContent?.trim() ??
      (el as HTMLInputElement).value?.trim() ??
      '';
    return /submit application/i.test(text);
  },
};
