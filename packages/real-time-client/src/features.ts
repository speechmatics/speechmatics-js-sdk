export async function getFeatures(
  region: Region = 'eu2',
): Promise<FeatureResponse> {
  const resp = await fetch(
    `https://${region}.rt.speechmatics.com/v1/discovery/features`,
  );

  return resp.json();
}

// https://docs.speechmatics.com/introduction/authentication#supported-endpoints
type Region = 'eu2' | 'neu' | 'wus';

export interface FeatureResponse {
  metadata: {
    language_pack_info: Record<
      string,
      {
        language_description: string;
        locales?: Record<string, { name: string }>;
      }
    >;
  };
  realtime: {
    transcription: [
      {
        version: 'latest';
        languages: string[];
        locales: Record<string, string[]>;
        domains: Record<string, string[]>;
      },
    ];
    translation: [
      {
        version: 'latest';
        languages: Record<string, string[]>;
      },
    ];
  };
}
