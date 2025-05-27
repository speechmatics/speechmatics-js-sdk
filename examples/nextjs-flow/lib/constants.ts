// We recommend using a sample rate of 16_000 Hz for real-time transcription.
// Anything higher will be downsampled by the server. Lower sample rates are also supported.

// Unfortunately Firefox doesn't support sample rates other than whatever the default is
// Since this isn't easily detectable, we set it to undefined, and read it from the context when needed
// See bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1725336
export const RECORDING_SAMPLE_RATE =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')
    ? undefined
    : 16_000;
