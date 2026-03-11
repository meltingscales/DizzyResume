/// AtsAdapter — interface every platform-specific adapter implements.
///
/// The generic fill logic in content.ts handles the common case.
/// Adapters hook in to handle platform quirks without rewriting the core.

import type { FieldCategory, Profile, ResumeVariant } from '../types';

export interface AtsAdapter {
  id: string;

  /** Extra field patterns beyond the generic ones (e.g. platform-specific input names). */
  extraPatterns?: Array<{ category: FieldCategory; patterns: RegExp[] }>;

  /**
   * Return true to skip a field entirely (e.g. EEO demographic fields on Greenhouse).
   * Called before any value lookup — skipped fields are not highlighted.
   */
  shouldSkip?: (el: HTMLElement, label: string) => boolean;

  /**
   * Called after all fields have been filled.
   * Use for platform-specific cleanup (e.g. closing autocomplete dropdowns).
   */
  afterFill?: (profile: Profile, variant: ResumeVariant | undefined) => Promise<void>;

  /**
   * Return true if the clicked element is a final-submit button that should
   * arm the application-logging watcher.
   * Falls back to the generic regex pattern if not provided.
   */
  isSubmitButton?: (el: Element) => boolean;
}
