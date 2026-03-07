import { invoke } from '@tauri-apps/api/core';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import type {
  Profile,
  ProfileStats,
  CreateProfileInput,
  ResumeVariant,
  CreateResumeVariantInput,
  UpdateResumeVariantInput,
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
  Snippet,
  CreateSnippetInput,
  UpdateSnippetInput,
  Application,
  CreateApplicationInput,
} from '../types';

// ── Profiles ──────────────────────────────────────────────────────────────────

export const api = {
  profiles: {
    get: (id: string) => invoke<Profile>('get_profile', { id }),
    list: () => invoke<Profile[]>('get_profiles'),
    create: (input: CreateProfileInput) =>
      invoke<Profile>('create_profile', { input }),
    update: (id: string, input: CreateProfileInput) =>
      invoke<Profile>('update_profile', { id, input }),
    delete: (id: string) => invoke<void>('delete_profile', { id }),
    stats: (profileId: string) =>
      invoke<ProfileStats>('get_profile_stats', { profileId }),
  },

  resumes: {
    list: (profileId: string) =>
      invoke<ResumeVariant[]>('get_resume_variants', { profileId }),
    create: (input: CreateResumeVariantInput) =>
      invoke<ResumeVariant>('create_resume_variant', { input }),
    update: (id: string, input: UpdateResumeVariantInput) =>
      invoke<ResumeVariant>('update_resume_variant', { id, input }),
    setDefault: (id: string, profileId: string) =>
      invoke<void>('set_default_variant', { id, profileId }),
    delete: (id: string) => invoke<void>('delete_resume_variant', { id }),
  },

  templates: {
    list: () => invoke<Template[]>('get_templates'),
    create: (input: CreateTemplateInput) =>
      invoke<Template>('create_template', { input }),
    update: (id: string, input: UpdateTemplateInput) =>
      invoke<Template>('update_template', { id, input }),
    recordUse: (id: string) => invoke<void>('record_template_use', { id }),
    delete: (id: string) => invoke<void>('delete_template', { id }),
  },

  snippets: {
    list: () => invoke<Snippet[]>('get_snippets'),
    create: (input: CreateSnippetInput) =>
      invoke<Snippet>('create_snippet', { input }),
    update: (id: string, input: UpdateSnippetInput) =>
      invoke<Snippet>('update_snippet', { id, input }),
    recordUse: (id: string) => invoke<void>('record_snippet_use', { id }),
    delete: (id: string) => invoke<void>('delete_snippet', { id }),
  },

  pdf: {
    /** Opens a native file picker then returns the extracted plain text, or null if cancelled. */
    import: async (): Promise<string | null> => {
      const path = await openFileDialog({
        multiple: false,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });
      if (!path) return null;
      return invoke<string>('extract_pdf_text', { path });
    },
  },

  applications: {
    list: (profileId: string) =>
      invoke<Application[]>('get_applications', { profileId }),
    create: (input: CreateApplicationInput) =>
      invoke<Application>('create_application', { input }),
    updateStatus: (id: string, status: string) =>
      invoke<Application>('update_application_status', { id, input: { status } }),
    delete: (id: string) => invoke<void>('delete_application', { id }),
  },
};
