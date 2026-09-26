// Centralized API Fetcher with custom Gemini API Key header injection
export function getStoredApiKey(): string {
  try {
    return localStorage.getItem('stutterframe-gemini-api-key') || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem('stutterframe-gemini-api-key');
    } else {
      localStorage.setItem('stutterframe-gemini-api-key', key.trim());
    }
  } catch (e) {
    console.warn('Could not save API key to localStorage', e);
  }
}

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const key = getStoredApiKey();
  const headers = new Headers(init?.headers || {});
  
  if (key && !headers.has('x-gemini-api-key')) {
    headers.set('x-gemini-api-key', key);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
