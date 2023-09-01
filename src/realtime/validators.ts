import z from 'zod';

import {
  RealtimeTranscriptionConfig,
  OperatingPoint,
  RealtimeDiarizationConfig,
  MaxDelayModeConfig,
} from '../types';

type AcceptableEnumValues = [string, ...string[]];

const TranscriptionConfigSchema = z.object({
  language: z.string(),
  domain: z.string().optional(),
  output_locale: z.string().optional(),
  operating_point: z
    .enum(Object.values(OperatingPoint) as AcceptableEnumValues)
    .optional(), // Replace with the Zod schema for `OperatingPoint`
  enable_partials: z.boolean().optional(),
  additional_vocab: z
    .array(
      z.union([
        z.string(),
        z.object({ content: z.string(), sounds_like: z.array(z.string()) }),
      ]),
    )
    .optional(),
  punctuation_overrides: z
    .object({
      sensitivity: z.number().min(0).max(1).optional(),
      permitted_marks: z.array(z.string()).optional(),
    })
    .optional(),
  diarization: z
    .enum(Object.values(RealtimeDiarizationConfig) as AcceptableEnumValues)
    .optional(),
  speaker_change_sensitivity: z.number().min(0).max(1).optional(),
  enable_entities: z.boolean().optional(),
  max_delay: z.number().min(2).max(10).optional(),
  max_delay_mode: z
    .enum(Object.values(MaxDelayModeConfig) as AcceptableEnumValues)
    .optional(),
  speaker_diarization_config: z
    .object({
      max_speakers: z.number().min(2).max(20).optional(),
    })
    .optional(), // Replace with the Zod schema for `TranscriptionConfigSpeakerDiarizationConfig`
});

export function validateOptions(
  options: RealtimeTranscriptionConfig,
): null | string {
  const result = TranscriptionConfigSchema.safeParse(options);

  if (result.success) {
    return null;
  } else {
    // Data is invalid
    return result.error.toString(); // ZodError type
  }
}
