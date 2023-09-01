export async function determineFileBuffer(
  urlOrBuffer: string | Buffer,
): Promise<Buffer> {
  if (typeof urlOrBuffer === 'string') {
    return await fetchFileBuffer(urlOrBuffer);
  } else if (urlOrBuffer instanceof Buffer) {
    return urlOrBuffer as Buffer;
  }

  return Promise.reject('SMjs error: Invalid file');
}

export async function fetchFileBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (response?.ok) {
    return Buffer.from(await response.arrayBuffer());
  } else {
    return Promise.reject(`SMjs error: ${response.statusText}`);
  }
}
