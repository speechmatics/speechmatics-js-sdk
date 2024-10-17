import type { ISO639_1_Language } from './languages';

export interface BatchFeatureDiscovery {
  metadata: {
    language_pack_info: Partial<
      Record<
        ISO639_1_Language,
        {
          language_description: string;
          locales: Record<string, { name: string }>;
        }
      >
    >;
  };
  batch: {
    transcription: TranscriptionVersion[];
    translation: TranslationVersion[];
    languageId: ISO639_1_Language[];
  };
}

interface TranscriptionVersion {
  version: string;
  languages: ISO639_1_Language[];
  locales: Partial<Record<ISO639_1_Language, string[]>>;
  domains?: Partial<Record<ISO639_1_Language, string[]>>;
}

interface TranslationVersion {
  version: string;
  languages: Partial<Record<ISO639_1_Language, ISO639_1_Language[]>>;
  languageId: ISO639_1_Language[];
}
