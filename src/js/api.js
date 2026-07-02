import { config } from './config.js';

async function request(path, options = {}) {
  const response = await fetch(`${config.API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;

    try {
      const errorPayload = await response.json();
      throw new Error(errorPayload.error || fallbackMessage);
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  return response.json();
}

export async function getAffordability(zipCode = config.DEFAULT_ZIP_CODE) {
  const encodedZip = encodeURIComponent(zipCode);
  return request(`/api/affordability?zipCode=${encodedZip}`);
}
