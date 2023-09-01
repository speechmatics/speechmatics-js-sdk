export function validateParams(apiKey: string, apiGateway?: string) {
  if (!apiKey) {
    throw new Error('Please provide an API key');
  }

  if (apiGateway && !apiGateway.startsWith('http')) {
    throw new Error('Please provide a valid API gateway');
  }
}
